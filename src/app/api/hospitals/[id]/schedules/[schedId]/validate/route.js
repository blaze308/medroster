import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../../lib/db/mongo';
import { Hospital, Schedule, Staff, Assignment } from '../../../../../../../lib/db/models';
import { validateFullSchedule } from '../../../../../../../lib/validation';
import { logError } from '../../../../../../../lib/logger';

// POST /api/hospitals/[id]/schedules/[schedId]/validate — full-schedule check.
export async function POST(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, schedId } = await params;

        const [hospital, schedule, staff, assignments] = await Promise.all([
            Hospital.findById(hospitalId).lean(),
            Schedule.findOne({ _id: schedId, hospitalId }).lean(),
            Staff.find({ hospitalId }).lean(),
            Assignment.find({ scheduleId: schedId }).lean(),
        ]);
        if (!hospital || !schedule) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        const staffPlain = staff.map((s) => ({ ...s, _id: String(s._id) }));
        const assignPlain = assignments.map((a) => ({
            ...a,
            _id: String(a._id),
            staffId: String(a.staffId),
        }));

        const result = validateFullSchedule({
            staff: staffPlain,
            assignments: assignPlain,
            settings: hospital.settings,
        });

        return NextResponse.json(result);
    } catch (error) {
        logError('VALIDATE_API', 'Failed to validate schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
