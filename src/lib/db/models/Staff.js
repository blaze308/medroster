import mongoose from 'mongoose';
import {
    STAFF_CATEGORIES,
    QUALIFICATIONS,
    EMPLOYMENT_STATUSES,
    LEAVE_TYPES,
    GENDERS,
    MIN_ANNUAL_LEAVE_DAYS,
} from '../../ghana-data';

const LeaveRecordSchema = new mongoose.Schema(
    {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        leaveType: { type: String, enum: LEAVE_TYPES, default: 'Annual' },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Approved' },
        notes: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const EmergencyContactSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, maxlength: 200 },
        phone: { type: String, trim: true, maxlength: 30 },
        relation: { type: String, trim: true, maxlength: 50 },
    },
    { _id: false }
);

// Compute staffType from rank string. Used by the validation engine to enforce
// "no senior/PNO on night shifts" and "minimum supervisor coverage" rules.
function deriveStaffType(rank) {
    if (!rank) return 'regular';
    const r = rank.toLowerCase();

    // PNO tier: principals, matrons, directors
    if (
        r.includes('principal') ||
        r.includes('matron') ||
        r.includes('director') ||
        r.includes('chief')
    ) {
        return 'pno';
    }

    // Senior tier: senior officers, specialists, consultants
    if (
        r.includes('senior') ||
        r.includes('specialist') ||
        r.includes('consultant') ||
        // A bare "Nursing Officer" / "Midwifery Officer" / "Medical Officer"
        // (without "Senior") is the entry-level officer cadre — still counted
        // as senior for coverage purposes.
        r === 'nursing officer' ||
        r === 'midwifery officer' ||
        r === 'medical officer'
    ) {
        return 'senior';
    }

    return 'regular';
}

const StaffSchema = new mongoose.Schema(
    {
        hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },

        // Personal
        firstName: { type: String, required: true, trim: true, maxlength: 100 },
        lastName: { type: String, required: true, trim: true, maxlength: 100 },
        employeeId: { type: String, trim: true, maxlength: 50 }, // hospital-issued staff ID
        ghanaCardNumber: { type: String, trim: true, maxlength: 30 }, // GHA-XXXXXXXXX-X
        dateOfBirth: { type: Date },
        gender: { type: String, enum: GENDERS },
        phone: { type: String, trim: true, maxlength: 30 },
        email: { type: String, trim: true, lowercase: true, maxlength: 200 },
        address: { type: String, trim: true, maxlength: 300 },

        // Professional
        category: { type: String, enum: STAFF_CATEGORIES, default: 'Nurse' },
        rank: { type: String, trim: true, maxlength: 100 }, // e.g. "Senior Nursing Officer"
        qualification: { type: String, enum: [...QUALIFICATIONS, ''], default: '' },
        specialization: { type: String, trim: true, maxlength: 200 },

        // Licensing
        licenseType: { type: String, default: '' }, // 'PIN' | 'AIN' | 'MDC' | 'PSGH' | 'AHPC' | 'Other' | ''
        licenseNumber: { type: String, trim: true, maxlength: 50 },
        licenseExpiry: { type: Date },

        // Employment
        dateHired: { type: Date },
        employmentStatus: { type: String, enum: EMPLOYMENT_STATUSES, default: 'Active' },

        // Derived (set by pre-save hook). Used by validation engine.
        staffType: { type: String, enum: ['regular', 'senior', 'pno'], default: 'regular' },

        // Emergency contact
        emergencyContact: { type: EmergencyContactSchema, default: () => ({}) },

        // Leave
        annualLeaveBalance: { type: Number, default: MIN_ANNUAL_LEAVE_DAYS, min: 0 },
        leaveRecords: { type: [LeaveRecordSchema], default: [] },
    },
    { timestamps: true }
);

StaffSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

StaffSchema.set('toJSON', { virtuals: true });
StaffSchema.set('toObject', { virtuals: true });

StaffSchema.index({ hospitalId: 1, departmentId: 1 });
StaffSchema.index({ hospitalId: 1, employeeId: 1 }, { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } });

StaffSchema.pre('save', function (next) {
    if (this.isModified('rank')) {
        this.staffType = deriveStaffType(this.rank);
    }
    next();
});

StaffSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate() || {};
    const set = update.$set || update;
    if (set.rank !== undefined) {
        const newType = deriveStaffType(set.rank);
        if (update.$set) update.$set.staffType = newType;
        else update.staffType = newType;
    }
    next();
});

export { deriveStaffType };
export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
