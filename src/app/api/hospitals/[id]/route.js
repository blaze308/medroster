import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/db/mongo';
import { Hospital, Department, Staff, Schedule, Assignment } from '../../../../lib/db/models';
import { logDataModification, logError } from '../../../../lib/logger';

// GET /api/hospitals/[id] — full hospital with departments + staff + schedules counts.
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id } = await params;

        const hospital = await Hospital.findById(id).lean();
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        const [departments, staffCount, scheduleCount] = await Promise.all([
            Department.find({ hospitalId: id }).sort({ name: 1 }).lean(),
            Staff.countDocuments({ hospitalId: id }),
            Schedule.countDocuments({ hospitalId: id }),
        ]);

        return NextResponse.json({
            ...hospital,
            _id: String(hospital._id),
            departments: departments.map((d) => ({ ...d, _id: String(d._id), hospitalId: String(d.hospitalId) })),
            counts: {
                departments: departments.length,
                staff: staffCount,
                schedules: scheduleCount,
            },
        });
    } catch (error) {
        logError('HOSPITALS_API', 'Failed to fetch hospital', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/hospitals/[id] — update hospital fields or settings.
export async function PATCH(request, { params }) {
    try {
        await connectMongo();
        const { id } = await params;
        const body = await request.json();

        const allowed = ['name', 'type', 'region', 'location', 'ghsCode', 'shiftTypes', 'settings'];
        const update = {};
        for (const key of allowed) {
            if (body[key] !== undefined) update[key] = body[key];
        }

        const hospital = await Hospital.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        logDataModification('UPDATE', 'hospital', id, { fields: Object.keys(update) });
        return NextResponse.json(hospital.toJSON());
    } catch (error) {
        logError('HOSPITALS_API', 'Failed to update hospital', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id] — delete hospital and cascade departments/staff/schedules/assignments.
export async function DELETE(_request, { params }) {
    try {
        await connectMongo();
        const { id } = await params;

        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        const [depRes, staffRes, schedRes, assignRes] = await Promise.all([
            Department.deleteMany({ hospitalId: id }),
            Staff.deleteMany({ hospitalId: id }),
            Schedule.deleteMany({ hospitalId: id }),
            Assignment.deleteMany({ hospitalId: id }),
        ]);

        await hospital.deleteOne();

        logDataModification('DELETE', 'hospital', id, {
            name: hospital.name,
            cascade: {
                departments: depRes.deletedCount,
                staff: staffRes.deletedCount,
                schedules: schedRes.deletedCount,
                assignments: assignRes.deletedCount,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logError('HOSPITALS_API', 'Failed to delete hospital', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
