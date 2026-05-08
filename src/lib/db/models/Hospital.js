import mongoose from 'mongoose';
import { HOSPITAL_TYPES, GHANA_REGIONS, DEFAULT_SHIFT_TYPES, getDefaultHospitalSettings } from '../../ghana-data';

const ShiftTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        color: { type: String, required: true }, // 'morning' | 'afternoon' | 'night' | custom
        startTime: { type: String, required: true }, // 'HH:MM'
        endTime: { type: String, required: true }, // 'HH:MM'
    },
    { _id: true }
);

const ValidationRulesSchema = new mongoose.Schema(
    {
        enforceLeaveConflicts: { type: Boolean, default: true },
        enforceRoleShiftRestrictions: { type: Boolean, default: true },
        enforceSupervisoryCoverage: { type: Boolean, default: true },
        warnConsecutiveShifts: { type: Boolean, default: true },
    },
    { _id: false }
);

const SettingsSchema = new mongoose.Schema(
    {
        maxConsecutiveDays: { type: Number, default: 6, min: 1, max: 14 },
        maxConsecutiveNights: { type: Number, default: 3, min: 1, max: 7 },
        minSeniorStaffPerDay: { type: Number, default: 1, min: 0, max: 20 },
        maxHoursPerWeek: { type: Number, default: 48, min: 20, max: 80 },
        validationRules: { type: ValidationRulesSchema, default: () => ({}) },
    },
    { _id: false }
);

const HospitalSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        type: { type: String, enum: HOSPITAL_TYPES, default: 'District Hospital' },
        region: { type: String, enum: GHANA_REGIONS, default: 'Greater Accra' },
        location: { type: String, trim: true, maxlength: 200 }, // city/town/address
        ghsCode: { type: String, trim: true, maxlength: 50 }, // optional GHS facility code
        shiftTypes: {
            type: [ShiftTypeSchema],
            default: () => DEFAULT_SHIFT_TYPES.map((s) => ({ ...s })),
        },
        settings: { type: SettingsSchema, default: () => getDefaultHospitalSettings() },
    },
    { timestamps: true }
);

HospitalSchema.index({ name: 1 });

export default mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema);
