import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
    {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// One hospital can't have two departments with the same name.
DepartmentSchema.index({ hospitalId: 1, name: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
