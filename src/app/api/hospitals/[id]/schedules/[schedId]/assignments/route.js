import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../../lib/db/mongo';
import { Hospital, Schedule, Staff, Assignment } from '../../../../../../../lib/db/models';
import { validateAssignment } from '../../../../../../../lib/validation';
import { logDataModification, logValidationFailure, logError } from '../../../../../../../lib/logger';

// POST /api/hospitals/[id]/schedules/[schedId]/assignments
//   Body: { staffId, date, shiftTypeId } | { staffId, date, shiftTypeId: null } to clear
export async function POST(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;
        const body = await request.json();
        const { staffId, date, shiftTypeId } = body;

        if (!staffId || !date) {
            return NextResponse.json({ error: 'staffId and date are required' }, { status: 400 });
        }

        const [hospital, schedule, staff] = await Promise.all([
            Hospital.findById(hospitalId).lean(),
            Schedule.findOne({ _id: schedId, hospitalId }).lean(),
            Staff.findOne({ _id: staffId, hospitalId }).lean(),
        ]);

        if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        // null shiftTypeId means "clear assignment for this cell"
        if (!shiftTypeId) {
            const removed = await Assignment.findOneAndDelete({ scheduleId: schedId, staffId, date: dateObj });
            if (removed) {
                logDataModification('DELETE', 'assignment', String(removed._id), {
                    staffId,
                    date: dateObj.toISOString(),
                });
            }
            return NextResponse.json({ success: true, removed: !!removed });
        }

        const shiftType = (hospital.shiftTypes || []).find((st) => String(st._id) === String(shiftTypeId));
        if (!shiftType) return NextResponse.json({ error: 'Shift type not found' }, { status: 404 });

        // Validate against rules
        const allAssignments = await Assignment.find({ scheduleId: schedId }).lean();
        const result = validateAssignment({
            staff,
            date: dateObj,
            shiftType,
            context: {
                assignments: allAssignments.map((a) => ({ ...a, staffId: String(a.staffId) })),
                settings: hospital.settings,
            },
        });

        if (!result.valid) {
            logValidationFailure(schedId, result.errors);
            return NextResponse.json(
                { error: 'Validation failed', errors: result.errors, warnings: result.warnings },
                { status: 400 }
            );
        }

        const shiftSnap = {
            name: shiftType.name,
            color: shiftType.color,
            startTime: shiftType.startTime,
            endTime: shiftType.endTime,
        };

        // Upsert: one assignment per (schedule, staff, date)
        const assignment = await Assignment.findOneAndUpdate(
            { scheduleId: schedId, staffId, date: dateObj },
            {
                $set: {
                    scheduleId: schedId,
                    hospitalId,
                    staffId,
                    departmentId: staff.departmentId,
                    date: dateObj,
                    shiftType: shiftSnap,
                },
            },
            { new: true, upsert: true, runValidators: true }
        );

        logDataModification('UPSERT', 'assignment', String(assignment._id), {
            staffId,
            date: dateObj.toISOString(),
            shift: shiftSnap.name,
        });

        return NextResponse.json({
            assignment: {
                ...assignment.toObject(),
                _id: String(assignment._id),
                scheduleId: String(assignment.scheduleId),
                hospitalId: String(assignment.hospitalId),
                staffId: String(assignment.staffId),
                departmentId: String(assignment.departmentId),
            },
            warnings: result.warnings,
        });
    } catch (error) {
        logError('ASSIGNMENTS_API', 'Failed to create assignment', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id]/schedules/[schedId]/assignments
//   ?clearAll=true       — clear every assignment in the schedule
//   ?staffId=...&date=... — clear one cell
export async function DELETE(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;
        const { searchParams } = new URL(request.url);

        if (searchParams.get('clearAll') === 'true') {
            const res = await Assignment.deleteMany({ scheduleId: schedId, hospitalId });
            logDataModification('CLEAR', 'assignments', schedId, { count: res.deletedCount });
            return NextResponse.json({ success: true, removed: res.deletedCount });
        }

        const staffId = searchParams.get('staffId');
        const date = searchParams.get('date');
        if (!staffId || !date) {
            return NextResponse.json({ error: 'staffId and date or clearAll are required' }, { status: 400 });
        }
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);

        const removed = await Assignment.findOneAndDelete({ scheduleId: schedId, staffId, date: dateObj });
        if (removed) {
            logDataModification('DELETE', 'assignment', String(removed._id), {
                staffId,
                date: dateObj.toISOString(),
            });
        }
        return NextResponse.json({ success: true, removed: !!removed });
    } catch (error) {
        logError('ASSIGNMENTS_API', 'Failed to delete assignment(s)', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
