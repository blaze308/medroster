import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../lib/db/mongo';
import { Department, Staff } from '../../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../../lib/logger';

// PATCH /api/hospitals/[id]/departments/[depId] — rename or edit a department.
export async function PATCH(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, depId } = await params;
        const body = await request.json();

        const allowed = ['name', 'description', 'isActive'];
        const update = {};
        for (const key of allowed) {
            if (body[key] !== undefined) update[key] = body[key];
        }
        if (update.name) update.name = String(update.name).trim();

        const dept = await Department.findOneAndUpdate(
            { _id: depId, hospitalId },
            update,
            { new: true, runValidators: true }
        );
        if (!dept) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        logDataModification('UPDATE', 'department', depId, { fields: Object.keys(update) });
        return NextResponse.json({ ...dept.toObject(), _id: String(dept._id), hospitalId: String(dept.hospitalId) });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A department with this name already exists' }, { status: 409 });
        }
        logError('DEPARTMENTS_API', 'Failed to update department', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id]/departments/[depId] — delete department + reassign cleanup.
// Refuses to delete if staff are still attached (avoid orphaned staff).
export async function DELETE(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, depId } = await params;

        const staffCount = await Staff.countDocuments({ departmentId: depId });
        if (staffCount > 0) {
            return NextResponse.json(
                {
                    error: `Cannot delete: ${staffCount} staff member(s) still assigned. Move them to another department first.`,
                },
                { status: 409 }
            );
        }

        const dept = await Department.findOneAndDelete({ _id: depId, hospitalId });
        if (!dept) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        logDataModification('DELETE', 'department', depId, { name: dept.name, hospitalId });
        return NextResponse.json({ success: true });
    } catch (error) {
        logError('DEPARTMENTS_API', 'Failed to delete department', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
