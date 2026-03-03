import { readData, writeData, generateId } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// POST create or update assignment
export async function POST(request, { params }) {
    try {
        const { id: timetableId } = await params;
        const body = await request.json();
        const { staffId, shiftTypeId, date } = body;

        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === timetableId);

        if (!timetable) {
            return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
        }

        if (!timetable.assignments) timetable.assignments = [];

        // Find if an assignment exists for this staff on this date
        const dateISO = new Date(date).toISOString().split('T')[0];
        const existingIndex = timetable.assignments.findIndex(a =>
            a.staffId === staffId &&
            new Date(a.date).toISOString().split('T')[0] === dateISO
        );

        const shiftType = (timetable.shiftTypes || []).find(st => st.id === shiftTypeId);

        if (existingIndex !== -1) {
            // Update
            timetable.assignments[existingIndex].shiftTypeId = shiftTypeId;
            timetable.assignments[existingIndex].shiftType = shiftType; // Include for UI
        } else {
            // Create
            timetable.assignments.push({
                id: generateId(),
                staffId,
                shiftTypeId,
                date: new Date(date).toISOString(),
                timetableId,
                shiftType: shiftType // Include for UI
            });
        }

        writeData(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE assignment
export async function DELETE(request, { params }) {
    try {
        const { id: timetableId } = await params;
        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staffId');
        const date = searchParams.get('date');

        if (!staffId || !date) {
            return NextResponse.json({ error: 'staffId and date required' }, { status: 400 });
        }

        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === timetableId);

        if (timetable && timetable.assignments) {
            const dateISO = new Date(date).toISOString().split('T')[0];
            timetable.assignments = timetable.assignments.filter(a =>
                !(a.staffId === staffId && new Date(a.date).toISOString().split('T')[0] === dateISO)
            );
            writeData(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
