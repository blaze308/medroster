import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/db/mongo';
import { Hospital, Schedule, Assignment } from '../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../lib/logger';

// Helpers: normalise weekStart to Monday 00:00 local, compute weekEnd as Sunday 23:59.
function normalizeWeek(weekStart) {
    const d = new Date(weekStart);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    // Snap to Monday: getDay() returns 0=Sun..6=Sat
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // shift so Monday is start
    d.setDate(d.getDate() + diff);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start: d, end };
}

// GET /api/hospitals/[id]/schedules — list schedules with assignment counts.
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const schedules = await Schedule.find({ hospitalId }).sort({ weekStart: -1 }).lean();

        const ids = schedules.map((s) => s._id);
        const counts = await Assignment.aggregate([
            { $match: { scheduleId: { $in: ids } } },
            { $group: { _id: '$scheduleId', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

        return NextResponse.json(
            schedules.map((s) => ({
                ...s,
                _id: String(s._id),
                hospitalId: String(s.hospitalId),
                assignmentCount: countMap.get(String(s._id)) || 0,
            }))
        );
    } catch (error) {
        logError('SCHEDULES_API', 'Failed to list schedules', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/hospitals/[id]/schedules — create a new weekly schedule.
//   Body: { weekStart, name? }
export async function POST(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const body = await request.json();

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        const week = normalizeWeek(body.weekStart);
        if (!week) {
            return NextResponse.json({ error: 'Invalid weekStart' }, { status: 400 });
        }

        // Refuse duplicate schedules for the same week
        const existing = await Schedule.findOne({ hospitalId, weekStart: week.start });
        if (existing) {
            return NextResponse.json(
                { error: 'A schedule for this week already exists', scheduleId: String(existing._id) },
                { status: 409 }
            );
        }

        const schedule = await Schedule.create({
            hospitalId,
            name: body.name?.trim() || '',
            weekStart: week.start,
            weekEnd: week.end,
            status: 'draft',
        });

        logDataModification('CREATE', 'schedule', String(schedule._id), {
            hospitalId,
            weekStart: week.start.toISOString(),
        });

        return NextResponse.json(
            { ...schedule.toObject(), _id: String(schedule._id), hospitalId: String(schedule.hospitalId) },
            { status: 201 }
        );
    } catch (error) {
        logError('SCHEDULES_API', 'Failed to create schedule', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
