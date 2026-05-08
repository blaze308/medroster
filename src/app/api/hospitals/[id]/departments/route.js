import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/db/mongo';
import { Hospital, Department } from '../../../../../lib/db/models';
import { logDataModification, logError } from '../../../../../lib/logger';

// GET /api/hospitals/[id]/departments — list departments for a hospital.
export async function GET(_request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const departments = await Department.find({ hospitalId }).sort({ name: 1 }).lean();
        return NextResponse.json(
            departments.map((d) => ({ ...d, _id: String(d._id), hospitalId: String(d.hospitalId) }))
        );
    } catch (error) {
        logError('DEPARTMENTS_API', 'Failed to list departments', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/hospitals/[id]/departments — create one or many departments.
// Body: { name, description? }  OR  { departments: [{ name, description? }, ...] }
export async function POST(request, { params }) {
    try {
        await connectMongo();
        const { id: hospitalId } = await params;
        const body = await request.json();

        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        // Bulk create
        if (Array.isArray(body.departments)) {
            const seen = new Set();
            const valid = body.departments
                .map((d) => ({
                    hospitalId,
                    name: String(d.name || '').trim(),
                    description: String(d.description || '').trim(),
                }))
                .filter((d) => {
                    if (!d.name) return false;
                    const key = d.name.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

            if (valid.length === 0) {
                return NextResponse.json({ error: 'No valid department names provided' }, { status: 400 });
            }

            const created = await Department.insertMany(valid, { ordered: false }).catch((err) => {
                // Some duplicates may exist; return what was inserted
                if (err.insertedDocs) return err.insertedDocs;
                throw err;
            });

            logDataModification('CREATE', 'departments', hospitalId, {
                count: created.length,
                names: created.map((d) => d.name),
            });

            return NextResponse.json(
                created.map((d) => ({ ...d.toObject(), _id: String(d._id), hospitalId: String(d.hospitalId) })),
                { status: 201 }
            );
        }

        // Single create
        const name = String(body.name || '').trim();
        if (!name) {
            return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
        }

        const dept = await Department.create({
            hospitalId,
            name,
            description: String(body.description || '').trim(),
        });

        logDataModification('CREATE', 'department', String(dept._id), { name, hospitalId });
        return NextResponse.json(
            { ...dept.toObject(), _id: String(dept._id), hospitalId: String(dept.hospitalId) },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'A department with this name already exists' }, { status: 409 });
        }
        logError('DEPARTMENTS_API', 'Failed to create departments', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
