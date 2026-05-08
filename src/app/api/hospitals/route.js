import { NextResponse } from 'next/server';
import connectMongo from '../../../lib/db/mongo';
import { Hospital, Department, Staff, Schedule } from '../../../lib/db/models';
import { logDataModification, logError } from '../../../lib/logger';

// GET /api/hospitals — list all hospitals with summary counts.
export async function GET() {
    try {
        await connectMongo();
        const hospitals = await Hospital.find().sort({ createdAt: -1 }).lean();

        // Counts for each hospital, batched via aggregation for departments+staff+schedules
        const ids = hospitals.map((h) => h._id);

        const [deptCounts, staffCounts, scheduleCounts] = await Promise.all([
            Department.aggregate([
                { $match: { hospitalId: { $in: ids } } },
                { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
            ]),
            Staff.aggregate([
                { $match: { hospitalId: { $in: ids } } },
                { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
            ]),
            Schedule.aggregate([
                { $match: { hospitalId: { $in: ids } } },
                { $group: { _id: '$hospitalId', count: { $sum: 1 } } },
            ]),
        ]);

        const toMap = (arr) => new Map(arr.map((r) => [String(r._id), r.count]));
        const deptMap = toMap(deptCounts);
        const staffMap = toMap(staffCounts);
        const schedMap = toMap(scheduleCounts);

        const enriched = hospitals.map((h) => ({
            ...h,
            _id: String(h._id),
            counts: {
                departments: deptMap.get(String(h._id)) || 0,
                staff: staffMap.get(String(h._id)) || 0,
                schedules: schedMap.get(String(h._id)) || 0,
            },
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        logError('HOSPITALS_API', 'Failed to list hospitals', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/hospitals — create a hospital.
export async function POST(request) {
    try {
        await connectMongo();
        const body = await request.json();
        const { name, type, region, location, ghsCode } = body;

        if (!name) {
            return NextResponse.json({ error: 'Hospital name is required' }, { status: 400 });
        }

        const hospital = await Hospital.create({
            name: name.trim(),
            type: type || undefined,
            region: region || undefined,
            location: location || '',
            ghsCode: ghsCode || '',
        });

        logDataModification('CREATE', 'hospital', String(hospital._id), { name: hospital.name });
        return NextResponse.json(hospital.toJSON(), { status: 201 });
    } catch (error) {
        logError('HOSPITALS_API', 'Failed to create hospital', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
