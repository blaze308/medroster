# MedRoster — Ghana Hospital Rostering

A production-ready hospital workforce management platform built around the structure of Ghana Health Service facilities. Roster nurses, midwives, doctors, and allied staff while enforcing leave, role, and supervisory rules out of the box.

---

## Domain model

```
Hospital
├── shiftTypes (Morning / Afternoon / Night, editable)
├── settings (validation rules + scheduling limits)
├── Department[]
├── Staff[]            ── leaveRecords (embedded)
└── Schedule[]         ── Assignment[]
```

- `Hospital` — name, type, region (16 Ghana regions), location, default shifts, validation settings.
- `Department` — wards/units (Accident & Emergency, Maternity, Pharmacy, ICU, ...). Pre-built templates seeded from Korle Bu / Komfo Anokye / GARH structures.
- `Staff` — full Ghana profile (see fields below). One staff member belongs to exactly one department.
- `Schedule` — a weekly roster (Mon → Sun) with `draft`/`published`/`archived` status.
- `Assignment` — one staff + one date + one shift snapshot, scoped to a Schedule.

### Ghana-specific staff fields

Personal · firstName, lastName, employeeId, ghanaCardNumber (`GHA-XXXXXXXXX-X`), DOB, gender, phone, email, address.

Professional · category (Nurse, Midwife, Doctor, Pharmacist, Lab Tech, Radiographer, Physiotherapist, Anaesthetist, ...), rank (Ghana Health Service hierarchy: NAC/NAP → RGN → SSN → NO → SNO → PNO → DDNS → DNS for nursing; House Officer → Medical Officer → Specialist → Consultant for doctors), qualification, specialization.

Licensing · licenseType (PIN via Nursing & Midwifery Council, AIN for nurse assistants, MDC for Medical & Dental Council, PSGH for Pharmacy Council, AHPC for Allied Health), licenseNumber, licenseExpiry.

Employment · dateHired, employmentStatus (Active / On Leave / Suspended / Retired / Terminated / Probation).

Leave · annualLeaveBalance (default 15 days per Ghana Labour Act 651), leaveRecords[] with type (Annual / Sick / Maternity / Paternity / Study / Compassionate / Casual / Unpaid).

Emergency contact · name, phone, relation.

Derived · `staffType` is computed from the `rank` string in a pre-save hook: Principal/Matron/Director/Chief → `pno`, Senior/Specialist/Consultant/Officer → `senior`, otherwise `regular`. Used by the validation engine.

---

## Compliance rules built in

| Rule | Where it lives | Enforcement |
|------|----------------|-------------|
| Staff on leave can't work | `validateLeaveConflict` | Blocks assignment, removes shifts when leave is registered, gray cells in calendar |
| PNO/Senior can't work nights | `validateRoleShiftCompatibility` | Night option disabled in picker, server rejects, generator skips |
| Always a supervisor on duty | `validateSupervisoryCoverage` | Validation panel flags days below `minSeniorStaffPerDay` |
| Caps on consecutive days/nights | `validateConsecutiveShifts` | Soft warning surfaced in toasts + validation panel |
| Weekly hours cap | `validateMaxHoursPerWeek` | Soft warning when `maxHoursPerWeek` exceeded |

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4** with the Synclly design tokens
- **MongoDB + Mongoose** for persistence
- **Plus Jakarta Sans** typography
- File-based audit logging (`logs/audit.log`)

---

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MongoDB. Use Atlas or a local instance, then add the URI to `.env.local`:
   ```bash
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medroster
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

---

## User flow

1. **Landing** (`/`) — list of registered hospitals. Click "Register a Hospital".
2. **Setup** (`/hospital/[id]/setup`) — pick Ghana-standard department templates (multi-select), edit names, add custom ones.
3. **Dashboard** (`/hospital/[id]`) — three tabs:
   - **Departments** — add, rename, archive.
   - **Staff** — full Ghana profile form (Personal / Professional / Licensing / Employment / Emergency), department filter, leave management.
   - **Schedules** — list weekly rosters, status badges, click to open.
4. **Schedule view** (`/hospital/[id]/schedule/[schedId]`) — calendar grid, click any cell to assign, auto-generate, validate, configure settings.

---

## API surface

```
GET    /api/hospitals
POST   /api/hospitals
GET    /api/hospitals/[id]
PATCH  /api/hospitals/[id]
DELETE /api/hospitals/[id]

GET    /api/hospitals/[id]/departments
POST   /api/hospitals/[id]/departments         # bulk via { departments: [...] }
PATCH  /api/hospitals/[id]/departments/[depId]
DELETE /api/hospitals/[id]/departments/[depId]

GET    /api/hospitals/[id]/staff               # ?departmentId= filter
POST   /api/hospitals/[id]/staff
GET    /api/hospitals/[id]/staff/[staffId]
PATCH  /api/hospitals/[id]/staff/[staffId]
DELETE /api/hospitals/[id]/staff/[staffId]
GET    /api/hospitals/[id]/staff/[staffId]/leave
POST   /api/hospitals/[id]/staff/[staffId]/leave
DELETE /api/hospitals/[id]/staff/[staffId]/leave?leaveId=

GET    /api/hospitals/[id]/schedules
POST   /api/hospitals/[id]/schedules
GET    /api/hospitals/[id]/schedules/[schedId]   # full payload (hospital + departments + staff + assignments)
PATCH  /api/hospitals/[id]/schedules/[schedId]
DELETE /api/hospitals/[id]/schedules/[schedId]
POST   /api/hospitals/[id]/schedules/[schedId]/assignments   # upsert one cell
DELETE /api/hospitals/[id]/schedules/[schedId]/assignments?clearAll=true
POST   /api/hospitals/[id]/schedules/[schedId]/generate      # body: { departmentIds? }
POST   /api/hospitals/[id]/schedules/[schedId]/validate
```

---

## Project structure

```
src/
├── app/
│   ├── page.js                              # Hospitals landing
│   ├── hospital/[id]/
│   │   ├── page.js                          # Dashboard wrapper
│   │   ├── setup/page.js                    # Department template picker
│   │   └── schedule/[schedId]/page.js       # Calendar view wrapper
│   └── api/hospitals/...                    # REST routes (see above)
├── components/
│   ├── modals/
│   │   ├── CreateHospitalModal.js
│   │   ├── DepartmentTemplatePicker.js
│   │   ├── StaffFormModal.js
│   │   ├── LeaveModal.js
│   │   └── CreateScheduleModal.js
│   ├── hospital/
│   │   ├── HospitalDashboard.js
│   │   ├── HospitalSidebar.js
│   │   ├── DepartmentsTab.js
│   │   ├── StaffTab.js
│   │   └── SchedulesTab.js
│   └── schedule/
│       ├── SchedulePage.js
│       ├── CalendarGrid.js
│       ├── ShiftPicker.js
│       ├── ValidationPanel.js
│       └── SettingsModal.js
└── lib/
    ├── ghana-data.js          # Templates, regions, ranks, license types
    ├── staff-utils.js         # classifyStaffType, isStaffOnLeave (client-safe)
    ├── validation.js          # All scheduling validators
    ├── logger.js              # File-based audit log
    └── db/
        ├── mongo.js           # Cached connection helper
        └── models/
            ├── Hospital.js
            ├── Department.js
            ├── Staff.js
            ├── Schedule.js
            └── Assignment.js
```

---

## Default settings

```js
{
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
}
```

Editable per-hospital from the schedule view's gear icon.

---

## Notes

- Authentication is intentionally not implemented — single-deployment admin model.
- All data lives in MongoDB. There is no `data.json`.
- Audit events are appended to `logs/audit.log`.

---

*Built for Ghanaian healthcare excellence.*
