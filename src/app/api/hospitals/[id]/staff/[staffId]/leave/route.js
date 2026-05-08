import { NextResponse } from 'next/server';
import connectMongo from '../../../../../../../lib/db/mongo';
import { Staff, Assignment } from '../../../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../../../lib/logger';

// POST /api/hospitals/[id]/staff/[staffId]/leave
//   Body: { startDate, endDate, leaveType, notes }
//   Adds leave + automatically clears any conflicting assignments.
export async function POST(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;
        const body = await request.json();

        if (!body.startDate || !body.endDate) {
            return NextResponse.json({ error: 'Start and end date are required' }, { status: 400 });
        }
        const start = new Date(body.startDate);
        const end = new Date(body.endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }
        if (start > end) {
            return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
        }

        const staff = await Staff.findOne({ _id: staffId, hospitalId });
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        const leaveRecord = {
            startDate: start,
            endDate: end,
            leaveType: body.leaveType || 'Annual',
            status: 'Approved',
            notes: body.notes || '',
        };
        staff.leaveRecords.push(leaveRecord);
        await staff.save();

        // Remove conflicting assignments for this staff in the leave window.
        const assignDeletion = await Assignment.deleteMany({
            staffId,
            date: { $gte: start, $lte: end },
        });

        const newRecord = staff.leaveRecords[staff.leaveRecords.length - 1];

        logDataModification('CREATE', 'leave', String(newRecord._id), {
            staffId,
            staffName: `${staff.firstName} ${staff.lastName}`,
            startDate: body.startDate,
            endDate: body.endDate,
            type: leaveRecord.leaveType,
            removedAssignments: assignDeletion.deletedCount,
        });

        return NextResponse.json({
            leaveRecord: { ...newRecord.toObject(), _id: String(newRecord._id) },
            removedAssignments: assignDeletion.deletedCount,
        });
    } catch (error) {
        logError('LEAVE_API', 'Failed to add leave', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/hospitals/[id]/staff/[staffId]/leave?leaveId=...
export async function DELETE(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;
        const { searchParams } = new URL(request.url);
        const leaveId = searchParams.get('leaveId');
        if (!leaveId) return NextResponse.json({ error: 'leaveId is required' }, { status: 400 });

        const staff = await Staff.findOne({ _id: staffId, hospitalId });
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        const before = staff.leaveRecords.length;
        staff.leaveRecords = staff.leaveRecords.filter((l) => String(l._id) !== leaveId);
        if (staff.leaveRecords.length === before) {
            return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
        }
        await staff.save();

        logDataModification('DELETE', 'leave', leaveId, {
            staffId,
            staffName: `${staff.firstName} ${staff.lastName}`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logError('LEAVE_API', 'Failed to remove leave', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/hospitals/[id]/staff/[staffId]/leave
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId, staffId } = await params;
        const staff = await Staff.findOne({ _id: staffId, hospitalId }).lean();
        if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        return NextResponse.json(staff.leaveRecords || []);
    } catch (error) {
        logError('LEAVE_API', 'Failed to fetch leave', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
