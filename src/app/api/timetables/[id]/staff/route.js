import { readData, writeData, generateId } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// POST add staff to timetable
export async function POST(request, { params }) {
    try {
        const { id: timetableId } = await params;
        const body = await request.json();
        const { name, department, role } = body;

        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === timetableId);

        if (!timetable) {
            return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
        }

        const newStaff = {
            id: generateId(),
            name,
            department,
            role,
            timetableId
        };

        if (!timetable.staff) timetable.staff = [];
        timetable.staff.push(newStaff);
        writeData(data);

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE staff member
export async function DELETE(request, { params }) {
    try {
        const { id: timetableId } = await params;
        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staffId');

        if (!staffId) {
            return NextResponse.json({ error: 'staffId required' }, { status: 400 });
        }

        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === timetableId);

        if (timetable && timetable.staff) {
            timetable.staff = timetable.staff.filter(s => s.id !== staffId);
            // Also remove their assignments
            if (timetable.assignments) {
                timetable.assignments = timetable.assignments.filter(a => a.staffId !== staffId);
            }
            writeData(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
