import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../lib/db/mongo';
import { Staff, Department, Assignment } from '../../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../../lib/logger';

// GET /api/hospitals/[id]/staff/[staffId]
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;

        const staff = await Staff.findOne({ _id: staffId, hospitalId }).lean();
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        return NextResponse.json({
            ...staff,
            _id: String(staff._id),
            hospitalId: String(staff.hospitalId),
            departmentId: String(staff.departmentId),
            fullName: `${staff.firstName} ${staff.lastName}`.trim(),
        });
    } catch (error) {
        logError('STAFF_API', 'Failed to fetch staff', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/hospitals/[id]/staff/[staffId]
export async function PATCH(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;
        const body = await request.json();

        // If departmentId is changing, validate the new department.
        if (body.departmentId) {
            const dept = await Department.findOne({ _id: body.departmentId, hospitalId });
            if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        const allowed = [
            'firstName',
            'lastName',
            'employeeId',
            'ghanaCardNumber',
            'dateOfBirth',
            'gender',
            'phone',
            'email',
            'address',
            'category',
            'rank',
            'qualification',
            'specialization',
            'licenseType',
            'licenseNumber',
            'licenseExpiry',
            'dateHired',
            'employmentStatus',
            'emergencyContact',
            'annualLeaveBalance',
            'departmentId',
        ];
        const update = {};
        for (const k of allowed) {
            if (body[k] !== undefined) update[k] = body[k];
        }

        const staff = await Staff.findOneAndUpdate(
            { _id: staffId, hospitalId },
            update,
            { new: true, runValidators: true }
        );
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        logDataModification('UPDATE', 'staff', staffId, { fields: Object.keys(update) });

        return NextResponse.json({
            ...staff.toObject(),
            _id: String(staff._id),
            hospitalId: String(staff.hospitalId),
            departmentId: String(staff.departmentId),
            fullName: `${staff.firstName} ${staff.lastName}`.trim(),
        });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Employee ID already exists at this hospital' }, { status: 409 });
        }
        logError('STAFF_API', 'Failed to update staff', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id]/staff/[staffId]
export async function DELETE(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;

        const staff = await Staff.findOneAndDelete({ _id: staffId, hospitalId });
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        // Cascade: remove all of this staff's future assignments.
        const assignRes = await Assignment.deleteMany({ staffId });

        logDataModification('DELETE', 'staff', staffId, {
            name: `${staff.firstName} ${staff.lastName}`,
            removedAssignments: assignRes.deletedCount,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logError('STAFF_API', 'Failed to delete staff', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
