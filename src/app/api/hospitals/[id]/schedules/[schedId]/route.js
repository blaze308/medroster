import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../lib/db/mongo';
import { Hospital, Department, Schedule, Staff, Assignment } from '../../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../../lib/logger';

// GET /api/hospitals/[id]/schedules/[schedId]
//   Returns schedule + all hospital staff + departments + assignments + hospital shiftTypes/settings.
//   Useful single-call payload for the calendar view.
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;

        const [schedule, hospital, departments, staff, assignments] = await Promise.all([
            Schedule.findOne({ _id: schedId, hospitalId }).lean(),
            Hospital.findById(hospitalId).lean(),
            Department.find({ hospitalId }).sort({ name: 1 }).lean(),
            Staff.find({ hospitalId }).sort({ lastName: 1, firstName: 1 }).lean(),
            Assignment.find({ scheduleId: schedId }).lean(),
        ]);

        if (!schedule || !hospital) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        const staffWithName = staff.map((s) => ({
            ...s,
            _id: String(s._id),
            hospitalId: String(s.hospitalId),
            departmentId: String(s.departmentId),
            fullName: `${s.firstName} ${s.lastName}`.trim(),
        }));

        return NextResponse.json({
            schedule: {
                ...schedule,
                _id: String(schedule._id),
                hospitalId: String(schedule.hospitalId),
            },
            hospital: {
                ...hospital,
                _id: String(hospital._id),
                shiftTypes: (hospital.shiftTypes || []).map((st) => ({ ...st, _id: String(st._id) })),
            },
            departments: departments.map((d) => ({ ...d, _id: String(d._id), hospitalId: String(d.hospitalId) })),
            staff: staffWithName,
            assignments: assignments.map((a) => ({
                ...a,
                _id: String(a._id),
                scheduleId: String(a.scheduleId),
                hospitalId: String(a.hospitalId),
                staffId: String(a.staffId),
                departmentId: String(a.departmentId),
            })),
        });
    } catch (error) {
        logError('SCHEDULES_API', 'Failed to fetch schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/hospitals/[id]/schedules/[schedId] — update name or status.
export async function PATCH(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;
        const body = await request.json();

        const allowed = ['name', 'status', 'publishedAt'];
        const update = {};
        for (const k of allowed) {
            if (body[k] !== undefined) update[k] = body[k];
        }
        if (update.status === 'published' && !update.publishedAt) {
            update.publishedAt = new Date();
        }

        const schedule = await Schedule.findOneAndUpdate(
            { _id: schedId, hospitalId },
            update,
            { new: true, runValidators: true }
        );
        if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

        logDataModification('UPDATE', 'schedule', schedId, { fields: Object.keys(update) });
        return NextResponse.json({ ...schedule.toObject(), _id: String(schedule._id), hospitalId: String(schedule.hospitalId) });
    } catch (error) {
        logError('SCHEDULES_API', 'Failed to update schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id]/schedules/[schedId] — delete schedule + cascade assignments.
export async function DELETE(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;

        const schedule = await Schedule.findOneAndDelete({ _id: schedId, hospitalId });
        if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

        const res = await Assignment.deleteMany({ scheduleId: schedId });
        logDataModification('DELETE', 'schedule', schedId, { removedAssignments: res.deletedCount });

        return NextResponse.json({ success: true });
    } catch (error) {
        logError('SCHEDULES_API', 'Failed to delete schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
