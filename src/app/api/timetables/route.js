import { readData, writeData, generateId } from '../../../lib/db';
import { NextResponse } from 'next/server';

// GET all timetables
export async function GET() {
    try {
        const data = readData();
        const timetables = data.timetables.map(tt => ({
            ...tt,
            _count: {
                staff: tt.staff ? tt.staff.length : 0,
                assignments: tt.assignments ? tt.assignments.length : 0,
            }
        }));
        return NextResponse.json(timetables);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create new timetable
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, weekStart, weekEnd } = body;

        const data = readData();

        const newTimetable = {
            id: generateId(),
            name,
            weekStart: new Date(weekStart).toISOString(),
            weekEnd: new Date(weekEnd).toISOString(),
            createdAt: new Date().toISOString(),
            staff: [],
            shiftTypes: [
                { id: generateId(), name: 'Morning', color: 'morning', startTime: '06:00', endTime: '14:00' },
                { id: generateId(), name: 'Afternoon', color: 'afternoon', startTime: '14:00', endTime: '22:00' },
                { id: generateId(), name: 'Night', color: 'night', startTime: '22:00', endTime: '06:00' },
            ],
            assignments: [],
        };

        data.timetables.unshift(newTimetable);
        writeData(data);

        return NextResponse.json(newTimetable, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
