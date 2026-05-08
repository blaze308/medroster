import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../../lib/db/mongo';
import { Hospital, Schedule, Staff, Assignment } from '../../../../../../../lib/db/models';
import { isStaffOnLeave, classifyStaffType } from '../../../../../../../lib/staff-utils';
import { logAutoGeneration, logError } from '../../../../../../../lib/logger';

// POST /api/hospitals/[id]/schedules/[schedId]/generate
//   Body: { departmentIds?: string[] }
//   Auto-fills the week with shifts respecting:
//     - leave conflicts
//     - role-shift restrictions (no senior/PNO at night)
//     - minimum senior coverage per day
//     - workload balance (lowest-assigned staff picked first)
//
// Strategy:
//   For each day, for each shift type:
//     - Pick available staff (not on leave, not already assigned that day)
//     - Night shift: filter out senior/PNO
//     - Day shifts (non-Night): prefer at least one senior to satisfy coverage
//     - Sort by current assignment count (ascending) for fairness
//     - Take 1 person per shift type per day (per-department coverage is implicit)
export async function POST(request, { params }) {
    const t0 = Date.now();
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;
        const body = await request.json().catch(() => ({}));
        const departmentFilter = Array.isArray(body.departmentIds) ? body.departmentIds : null;

        const [hospital, schedule] = await Promise.all([
            Hospital.findById(hospitalId).lean(),
            Schedule.findOne({ _id: schedId, hospitalId }).lean(),
        ]);
        if (!hospital || !schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        const staffQuery = { hospitalId, employmentStatus: { $ne: 'Terminated' } };
        if (departmentFilter && departmentFilter.length > 0) {
            staffQuery.departmentId = { $in: departmentFilter };
        }
        const allStaff = await Staff.find(staffQuery).lean();
        if (allStaff.length === 0) {
            return NextResponse.json({ error: 'No staff available to schedule' }, { status: 400 });
        }

        // Wipe existing assignments in this schedule before regenerating.
        await Assignment.deleteMany({ scheduleId: schedId });

        const shiftTypes = hospital.shiftTypes || [];
        const settings = hospital.settings || {};
        const minSenior = settings.minSeniorStaffPerDay ?? 1;
        const maxConsecutive = settings.maxConsecutiveDays ?? 6;

        // Build the 7-day window
        const days = [];
        const start = new Date(schedule.weekStart);
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }

        const assignmentCounts = new Map(allStaff.map((s) => [String(s._id), 0]));
        const consecutiveTracker = new Map(allStaff.map((s) => [String(s._id), 0]));
        const lastWorkedDate = new Map();
        const created = [];

        const seniorIds = new Set(
            allStaff
                .filter((s) => {
                    const t = s.staffType || classifyStaffType(s.rank);
                    return t === 'senior' || t === 'pno';
                })
                .map((s) => String(s._id))
        );

        for (const day of days) {
            // Reset consecutive counters when there's a gap
            for (const [sid, last] of lastWorkedDate.entries()) {
                const diff = (day - last) / (24 * 3600 * 1000);
                if (diff > 1) consecutiveTracker.set(sid, 0);
            }

            const assignedToday = new Set();
            const seniorAssignedToday = new Set();

            for (const shift of shiftTypes) {
                const isNight = shift.name === 'Night';

                // Pool of candidates for this slot
                const pool = allStaff.filter((s) => {
                    const sid = String(s._id);
                    if (assignedToday.has(sid)) return false;
                    if (isStaffOnLeave(s, day)) return false;
                    if ((consecutiveTracker.get(sid) || 0) >= maxConsecutive) return false;
                    const t = s.staffType || classifyStaffType(s.rank);
                    if (isNight && (t === 'senior' || t === 'pno')) return false;
                    return true;
                });

                if (pool.length === 0) continue;

                // Sort by least-assigned for fairness
                pool.sort(
                    (a, b) => (assignmentCounts.get(String(a._id)) || 0) - (assignmentCounts.get(String(b._id)) || 0)
                );

                // For non-night shifts, prefer a senior if we still need to satisfy coverage
                let pick = pool[0];
                if (!isNight && seniorAssignedToday.size < minSenior) {
                    const seniorPick = pool.find((s) => seniorIds.has(String(s._id)));
                    if (seniorPick) pick = seniorPick;
                }

                const sid = String(pick._id);
                const snap = {
                    name: shift.name,
                    color: shift.color,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                };

                created.push({
                    scheduleId: schedId,
                    hospitalId,
                    staffId: sid,
                    departmentId: pick.departmentId,
                    date: day,
                    shiftType: snap,
                });

                assignmentCounts.set(sid, (assignmentCounts.get(sid) || 0) + 1);
                consecutiveTracker.set(sid, (consecutiveTracker.get(sid) || 0) + 1);
                lastWorkedDate.set(sid, day);
                assignedToday.add(sid);
                if (seniorIds.has(sid)) seniorAssignedToday.add(sid);
            }
        }

        if (created.length > 0) {
            await Assignment.insertMany(created);
        }

        logAutoGeneration(schedId, allStaff.length, created.length, Date.now() - t0);

        return NextResponse.json({
            success: true,
            assignmentsCreated: created.length,
            staffConsidered: allStaff.length,
        });
    } catch (error) {
        logError('GENERATE_API', 'Failed to auto-generate schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
