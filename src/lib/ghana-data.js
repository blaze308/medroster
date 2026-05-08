// Ghana healthcare reference data — used across UI templates, validators, and seed flows.
// Compiled from Ghana Health Service, Korle Bu, Komfo Anokye, GARH, and NMC sources.

// Hospital types per Ghana Health Service standards
export const HOSPITAL_TYPES = [
    'Teaching Hospital',
    'Regional Hospital',
    'District Hospital',
    'Polyclinic',
    'Health Centre',
    'Clinic',
    'Specialist Hospital',
    'CHPS Compound',
];

// 16 administrative regions of Ghana
export const GHANA_REGIONS = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Western North',
    'Central',
    'Eastern',
    'Volta',
    'Oti',
    'Northern',
    'North East',
    'Savannah',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
];

// Curated department templates drawn from Korle Bu, Komfo Anokye, and GARH structures.
// Each has a recommended description so admins can pick and tweak.
export const DEPARTMENT_TEMPLATES = [
    { name: 'Accident & Emergency', description: '24/7 emergency care and trauma response' },
    { name: 'Medicine & Therapeutics', description: 'General internal medicine and adult inpatient care' },
    { name: 'Surgery', description: 'General and specialised surgical services' },
    { name: 'Obstetrics & Gynaecology', description: 'Women\u2019s health, antenatal, and gynaecological care' },
    { name: 'Maternity', description: 'Labour, delivery, and postnatal ward' },
    { name: 'Child Health', description: 'Paediatrics and neonatal care' },
    { name: 'Intensive Care Unit', description: 'Critical and high-dependency care' },
    { name: 'Outpatient Department', description: 'Walk-in consultations and follow-up clinics' },
    { name: 'Pharmacy', description: 'Dispensing, drug management, and clinical pharmacy' },
    { name: 'Radiology', description: 'X-ray, ultrasound, CT, and imaging services' },
    { name: 'Pathology & Laboratory', description: 'Diagnostic lab and pathology services' },
    { name: 'Anaesthesia', description: 'Theatre and pain management support' },
    { name: 'Cardiology', description: 'Heart and cardiovascular care' },
    { name: 'Orthopaedics', description: 'Bone, joint, and trauma orthopaedic care' },
    { name: 'Eye Clinic', description: 'Ophthalmology and optometry services' },
    { name: 'ENT', description: 'Ear, nose, and throat care' },
    { name: 'Psychiatry', description: 'Mental health assessment and treatment' },
    { name: 'Physiotherapy', description: 'Rehabilitation and physical therapy' },
    { name: 'Dental', description: 'Dental and oral health services' },
    { name: 'Polyclinic', description: 'Family medicine and general practice' },
];

// Staff categories — high-level professional grouping
export const STAFF_CATEGORIES = [
    'Nurse',
    'Midwife',
    'Nurse Assistant',
    'Doctor',
    'Pharmacist',
    'Lab Technician',
    'Radiographer',
    'Physiotherapist',
    'Anaesthetist',
    'Dietitian',
    'Biomedical Scientist',
    'Health Records Officer',
    'Other',
];

// Ghana Health Service nursing/midwifery rank hierarchy (junior \u2192 senior)
// Source: Nursing and Midwifery Council of Ghana, GHS pay structure
export const NURSING_RANKS = [
    'Nurse Assistant Clinical',
    'Nurse Assistant Preventive',
    'Enrolled Nurse',
    'Staff Nurse',
    'Staff Midwife',
    'Senior Staff Nurse',
    'Senior Staff Midwife',
    'Nursing Officer',
    'Midwifery Officer',
    'Senior Nursing Officer',
    'Senior Midwifery Officer',
    'Principal Nursing Officer',
    'Principal Midwifery Officer',
    'Deputy Director of Nursing Services',
    'Director of Nursing Services',
];

// Medical & Dental Council ranks for doctors
export const MEDICAL_RANKS = [
    'House Officer',
    'Medical Officer',
    'Senior Medical Officer',
    'Specialist',
    'Senior Specialist',
    'Consultant',
    'Senior Consultant',
];

// Ranks for allied health and other categories — flexible string list
export const ALLIED_RANKS = [
    'Junior',
    'Officer',
    'Senior Officer',
    'Principal Officer',
    'Chief Officer',
    'Specialist',
    'Senior Specialist',
    'Consultant',
];

// Map category \u2192 rank list for the staff form dropdown
export const RANKS_BY_CATEGORY = {
    Nurse: NURSING_RANKS,
    Midwife: NURSING_RANKS,
    'Nurse Assistant': NURSING_RANKS,
    Doctor: MEDICAL_RANKS,
    Pharmacist: ALLIED_RANKS,
    'Lab Technician': ALLIED_RANKS,
    Radiographer: ALLIED_RANKS,
    Physiotherapist: ALLIED_RANKS,
    Anaesthetist: MEDICAL_RANKS,
    Dietitian: ALLIED_RANKS,
    'Biomedical Scientist': ALLIED_RANKS,
    'Health Records Officer': ALLIED_RANKS,
    Other: ALLIED_RANKS,
};

// Professional licensing bodies in Ghana
export const LICENSE_TYPES = [
    { code: 'PIN', name: 'Professional Identification Number', body: 'Nursing & Midwifery Council', appliesTo: ['Nurse', 'Midwife'] },
    { code: 'AIN', name: 'Auxiliary Identification Number', body: 'Nursing & Midwifery Council', appliesTo: ['Nurse Assistant'] },
    { code: 'MDC', name: 'Medical & Dental Council Registration', body: 'Medical & Dental Council', appliesTo: ['Doctor', 'Anaesthetist'] },
    { code: 'PSGH', name: 'Pharmacy Council Registration', body: 'Pharmacy Council of Ghana', appliesTo: ['Pharmacist'] },
    { code: 'AHPC', name: 'Allied Health Professions Council', body: 'AHPC Ghana', appliesTo: ['Lab Technician', 'Radiographer', 'Physiotherapist', 'Dietitian', 'Biomedical Scientist'] },
    { code: 'Other', name: 'Other / Not Applicable', body: '', appliesTo: [] },
];

export const QUALIFICATIONS = [
    'Certificate',
    'Diploma',
    'Bachelor\u2019s Degree',
    'Master\u2019s Degree',
    'PhD / Doctorate',
    'Fellowship',
];

export const EMPLOYMENT_STATUSES = [
    'Active',
    'On Leave',
    'Suspended',
    'Retired',
    'Terminated',
    'Probation',
];

export const LEAVE_TYPES = [
    'Annual',
    'Sick',
    'Maternity',
    'Paternity',
    'Study',
    'Compassionate',
    'Casual',
    'Unpaid',
];

// Ghana Labour Act 651 \u00a720: minimum 15 days annual leave
export const MIN_ANNUAL_LEAVE_DAYS = 15;

export const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'];

// Default shift types for any new hospital
export const DEFAULT_SHIFT_TYPES = [
    { name: 'Morning', color: 'morning', startTime: '06:00', endTime: '14:00' },
    { name: 'Afternoon', color: 'afternoon', startTime: '14:00', endTime: '22:00' },
    { name: 'Night', color: 'night', startTime: '22:00', endTime: '06:00' },
];

// Default validation/scheduling settings for any new hospital
export function getDefaultHospitalSettings() {
    return {
        maxConsecutiveDays: 6,
        maxConsecutiveNights: 3,
        minSeniorStaffPerDay: 1,
        maxHoursPerWeek: 48,
        validationRules: {
            enforceLeaveConflicts: true,
            enforceRoleShiftRestrictions: true,
            enforceSupervisoryCoverage: true,
            warnConsecutiveShifts: true,
        },
    };
}
