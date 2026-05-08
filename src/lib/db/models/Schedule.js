import mongoose from 'mongoose';

const ScheduleSchema = new mongoose.Schema(
    {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
        name: { type: String, trim: true, maxlength: 200 }, // optional human label
        weekStart: { type: Date, required: true },
        weekEnd: { type: Date, required: true },
        status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

ScheduleSchema.index({ hospitalId: 1, weekStart: -1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
