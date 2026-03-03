import { readData, writeData } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// GET single timetable
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const data = readData();
        const timetable = data.timetables.find(tt => tt.id === id);

        if (!timetable) {
            return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
        }

        return NextResponse.json(timetable);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE timetable
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const data = readData();
        const index = data.timetables.findIndex(tt => tt.id === id);

        if (index !== -1) {
            data.timetables.splice(index, 1);
            writeData(data);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
