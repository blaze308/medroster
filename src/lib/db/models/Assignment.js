import mongoose from 'mongoose';

const ShiftSnapshotSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        color: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
    },
    { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
    {
        scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true, index: true },
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
        staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
        date: { type: Date, required: true },
        // Snapshot of the shiftType so historical assignments stay correct even if
        // the hospital later edits its shift definitions.
        shiftType: { type: ShiftSnapshotSchema, required: true },
    },
    { timestamps: true }
);

// One staff member can only have a single assignment per day per schedule.
AssignmentSchema.index({ scheduleId: 1, staffId: 1, date: 1 }, { unique: true });

export default mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
