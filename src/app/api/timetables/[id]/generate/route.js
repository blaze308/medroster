import { readData, writeData, generateId } from '../../../../../lib/db';
import { NextResponse } from 'next/server';

// POST auto-generate schedule
export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === id);

        if (!timetable) {
            return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
        }

        if (!timetable.staff || timetable.staff.length === 0) {
            return NextResponse.json({ error: 'Add staff before generating schedule' }, { status: 400 });
        }

        if (!timetable.shiftTypes || timetable.shiftTypes.length === 0) {
            return NextResponse.json({ error: 'Add shift types before generating schedule' }, { status: 400 });
        }

        // Reset assignments
        timetable.assignments = [];

        // Generate dates for the week
        const start = new Date(timetable.weekStart);
        const end = new Date(timetable.weekEnd);
        const dates = [];
        let current = new Date(start);
        while (current <= end) {
            dates.push(new Date(current).toISOString());
            current.setDate(current.getDate() + 1);
        }

        const staff = timetable.staff;
        const shifts = timetable.shiftTypes;

        // Fair rotation algorithm
        for (let dayIdx = 0; dayIdx < dates.length; dayIdx++) {
            for (let staffIdx = 0; staffIdx < staff.length; staffIdx++) {
                const isWeekend = dayIdx >= 5;

                // On weekends, give ~30% staff off
                if (isWeekend && (staffIdx + dayIdx) % 3 === 0) {
                    continue;
                }

                // Cycle through shifts: morning -> afternoon -> night
                const shiftIdx = (staffIdx + dayIdx) % shifts.length;
                const shiftType = shifts[shiftIdx];

                timetable.assignments.push({
                    id: generateId(),
                    date: dates[dayIdx],
                    staffId: staff[staffIdx].id,
                    shiftTypeId: shiftType.id,
                    timetableId: id,
                    shiftType: shiftType, // UI expects this
                });
            }
        }

        writeData(data);
        return NextResponse.json(timetable);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
