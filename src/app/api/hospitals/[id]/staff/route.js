import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/db/mongo';
import { Hospital, Department, Staff } from '../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../lib/logger';

// GET /api/hospitals/[id]/staff
//   ?departmentId=... — optional filter
export async function GET(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('departmentId');

        const query = { hospitalId };
        if (departmentId) query.departmentId = departmentId;

        const staff = await Staff.find(query).sort({ lastName: 1, firstName: 1 }).lean();

        return NextResponse.json(
            staff.map((s) => ({
                ...s,
                _id: String(s._id),
                hospitalId: String(s.hospitalId),
                departmentId: String(s.departmentId),
                fullName: `${s.firstName} ${s.lastName}`.trim(),
            }))
        );
    } catch (error) {
        logError('STAFF_API', 'Failed to list staff', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/hospitals/[id]/staff — create staff member.
export async function POST(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const body = await request.json();

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        const { departmentId } = body;
        if (!departmentId) {
            return NextResponse.json({ error: 'Department is required' }, { status: 400 });
        }

        const dept = await Department.findOne({ _id: departmentId, hospitalId });
        if (!dept) {
            return NextResponse.json({ error: 'Department not found' }, { status: 404 });
        }

        if (!body.firstName?.trim() || !body.lastName?.trim()) {
            return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
        }

        const staff = await Staff.create({
            hospitalId,
            departmentId,
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            employeeId: body.employeeId?.trim() || undefined,
            ghanaCardNumber: body.ghanaCardNumber?.trim() || '',
            dateOfBirth: body.dateOfBirth || undefined,
            gender: body.gender || undefined,
            phone: body.phone?.trim() || '',
            email: body.email?.trim() || '',
            address: body.address?.trim() || '',
            category: body.category || 'Nurse',
            rank: body.rank?.trim() || '',
            qualification: body.qualification || '',
            specialization: body.specialization?.trim() || '',
            licenseType: body.licenseType || '',
            licenseNumber: body.licenseNumber?.trim() || '',
            licenseExpiry: body.licenseExpiry || undefined,
            dateHired: body.dateHired || undefined,
            employmentStatus: body.employmentStatus || 'Active',
            emergencyContact: body.emergencyContact || {},
            annualLeaveBalance: body.annualLeaveBalance ?? 15,
        });

        logDataModification('CREATE', 'staff', String(staff._id), {
            name: `${staff.firstName} ${staff.lastName}`,
            rank: staff.rank,
            staffType: staff.staffType,
            department: dept.name,
        });

        return NextResponse.json(
            {
                ...staff.toObject(),
                _id: String(staff._id),
                hospitalId: String(staff.hospitalId),
                departmentId: String(staff.departmentId),
                fullName: `${staff.firstName} ${staff.lastName}`.trim(),
            },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Employee ID already exists at this hospital' }, { status: 409 });
        }
        logError('STAFF_API', 'Failed to create staff', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
