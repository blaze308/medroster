'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    STAFF_CATEGORIES,
    RANKS_BY_CATEGORY,
    QUALIFICATIONS,
    LICENSE_TYPES,
    EMPLOYMENT_STATUSES,
    GENDERS,
    MIN_ANNUAL_LEAVE_DAYS,
} from '../../lib/ghana-data';

const SECTIONS = [
    { id: 'personal', label: 'Personal' },
    { id: 'professional', label: 'Professional' },
    { id: 'licensing', label: 'Licensing' },
    { id: 'employment', label: 'Employment' },
    { id: 'emergency', label: 'Emergency' },
];

function emptyStaff(departmentId) {
    return {
        firstName: '',
        lastName: '',
        employeeId: '',
        ghanaCardNumber: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        category: 'Nurse',
        rank: '',
        qualification: '',
        specialization: '',
        licenseType: '',
        licenseNumber: '',
        licenseExpiry: '',
        dateHired: '',
        employmentStatus: 'Active',
        emergencyContact: { name: '', phone: '', relation: '' },
        annualLeaveBalance: MIN_ANNUAL_LEAVE_DAYS,
        departmentId: departmentId || '',
    };
}

function toDateInput(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toISOString().split('T')[0];
}

export default function StaffFormModal({ hospitalId, departments, staff, defaultDepartmentId, onClose, onSaved }) {
    const isEdit = !!staff;
    const [active, setActive] = useState('personal');
    const [form, setForm] = useState(() => {
        if (staff) {
            return {
                ...emptyStaff(staff.departmentId),
                ...staff,
                emergencyContact: { name: '', phone: '', relation: '', ...(staff.emergencyContact || {}) },
                dateOfBirth: toDateInput(staff.dateOfBirth),
                licenseExpiry: toDateInput(staff.licenseExpiry),
                dateHired: toDateInput(staff.dateHired),
            };
        }
        return emptyStaff(defaultDepartmentId);
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const ranks = useMemo(() => RANKS_BY_CATEGORY[form.category] || RANKS_BY_CATEGORY.Other, [form.category]);

    // Auto-suggest license type from category
    useEffect(() => {
        if (isEdit) return;
        const match = LICENSE_TYPES.find((l) => l.appliesTo.includes(form.category));
        if (match && !form.licenseType) {
            setForm((f) => ({ ...f, licenseType: match.code }));
        }
    }, [form.category, form.licenseType, isEdit]);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
    const updateContact = (key, value) =>
        setForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: value } }));

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError('First and last name are required');
            setActive('personal');
            return;
        }
        if (!form.departmentId) {
            setError('Department is required');
            setActive('professional');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const url = isEdit
                ? `/api/hospitals/${hospitalId}/staff/${staff._id}`
                : `/api/hospitals/${hospitalId}/staff`;
            const method = isEdit ? 'PATCH' : 'POST';

            const payload = {
                ...form,
                annualLeaveBalance: Number(form.annualLeaveBalance) || 0,
                dateOfBirth: form.dateOfBirth || null,
                licenseExpiry: form.licenseExpiry || null,
                dateHired: form.dateHired || null,
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save staff');
                return;
            }
            onSaved(data);
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-3xl bg-white rounded-[40px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
                <div className="px-10 pt-10 pb-4 border-b border-slate-100">
                    <h2 className="text-2xl font-extrabold text-synclly-deep tracking-tight">
                        {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h2>
                    <p className="text-synclly-muted font-medium text-sm mt-1">
                        Full profile per Ghana Health Service standards.
                    </p>

                    <div className="flex gap-2 mt-6 overflow-x-auto -mx-1 px-1">
                        {SECTIONS.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setActive(s.id)}
                                className={`shrink-0 px-4 h-9 rounded-xl text-[11px] font-bold transition-all ${
                                    active === s.id
                                        ? 'bg-synclly-coral text-white shadow-md shadow-synclly-coral/20'
                                        : 'bg-synclly-surface text-synclly-muted hover:text-synclly-deep'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                    <div className="px-10 py-8 space-y-6">
                        {active === 'personal' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="First Name" required>
                                    <Input value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="Akosua" />
                                </Field>
                                <Field label="Last Name" required>
                                    <Input value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="Mensah" />
                                </Field>
                                <Field label="Ghana Card Number">
                                    <Input value={form.ghanaCardNumber} onChange={(v) => update('ghanaCardNumber', v)} placeholder="GHA-XXXXXXXXX-X" />
                                </Field>
                                <Field label="Date of Birth">
                                    <Input type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />
                                </Field>
                                <Field label="Gender">
                                    <Select value={form.gender} onChange={(v) => update('gender', v)} options={['', ...GENDERS]} placeholder="Select" />
                                </Field>
                                <Field label="Phone">
                                    <Input value={form.phone} onChange={(v) => update('phone', v)} placeholder="+233 24 000 0000" />
                                </Field>
                                <Field label="Email" full>
                                    <Input type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="staff@example.com" />
                                </Field>
                                <Field label="Address" full>
                                    <Input value={form.address} onChange={(v) => update('address', v)} placeholder="House no., street, city" />
                                </Field>
                            </div>
                        )}

                        {active === 'professional' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Employee ID">
                                    <Input value={form.employeeId} onChange={(v) => update('employeeId', v)} placeholder="e.g. KBTH-2421" />
                                </Field>
                                <Field label="Department" required>
                                    <Select
                                        value={form.departmentId}
                                        onChange={(v) => update('departmentId', v)}
                                        options={[
                                            { value: '', label: 'Select department' },
                                            ...departments.map((d) => ({ value: d._id, label: d.name })),
                                        ]}
                                    />
                                </Field>
                                <Field label="Category">
                                    <Select
                                        value={form.category}
                                        onChange={(v) => {
                                            update('category', v);
                                            update('rank', '');
                                        }}
                                        options={STAFF_CATEGORIES}
                                    />
                                </Field>
                                <Field label="Rank / Grade">
                                    <Select value={form.rank} onChange={(v) => update('rank', v)} options={['', ...ranks]} placeholder="Select rank" />
                                </Field>
                                <Field label="Qualification">
                                    <Select value={form.qualification} onChange={(v) => update('qualification', v)} options={['', ...QUALIFICATIONS]} placeholder="Select" />
                                </Field>
                                <Field label="Specialization">
                                    <Input value={form.specialization} onChange={(v) => update('specialization', v)} placeholder="e.g. Critical Care" />
                                </Field>
                            </div>
                        )}

                        {active === 'licensing' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="License Type">
                                    <Select
                                        value={form.licenseType}
                                        onChange={(v) => update('licenseType', v)}
                                        options={[
                                            { value: '', label: 'None' },
                                            ...LICENSE_TYPES.map((l) => ({ value: l.code, label: `${l.code} \u2014 ${l.name}` })),
                                        ]}
                                    />
                                </Field>
                                <Field label="License Number">
                                    <Input value={form.licenseNumber} onChange={(v) => update('licenseNumber', v)} placeholder="e.g. PIN-12345" />
                                </Field>
                                <Field label="License Expiry">
                                    <Input type="date" value={form.licenseExpiry} onChange={(v) => update('licenseExpiry', v)} />
                                </Field>
                                {form.licenseType && (
                                    <Field label="Issuing Body" full>
                                        <div className="h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-bold text-synclly-muted flex items-center">
                                            {LICENSE_TYPES.find((l) => l.code === form.licenseType)?.body || ''}
                                        </div>
                                    </Field>
                                )}
                            </div>
                        )}

                        {active === 'employment' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Date Hired">
                                    <Input type="date" value={form.dateHired} onChange={(v) => update('dateHired', v)} />
                                </Field>
                                <Field label="Employment Status">
                                    <Select value={form.employmentStatus} onChange={(v) => update('employmentStatus', v)} options={EMPLOYMENT_STATUSES} />
                                </Field>
                                <Field label={`Annual Leave Balance (days, Labour Act min: ${MIN_ANNUAL_LEAVE_DAYS})`} full>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={form.annualLeaveBalance}
                                        onChange={(v) => update('annualLeaveBalance', v)}
                                    />
                                </Field>
                            </div>
                        )}

                        {active === 'emergency' && (
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Contact Name" full>
                                    <Input value={form.emergencyContact.name} onChange={(v) => updateContact('name', v)} />
                                </Field>
                                <Field label="Contact Phone">
                                    <Input value={form.emergencyContact.phone} onChange={(v) => updateContact('phone', v)} placeholder="+233 ..." />
                                </Field>
                                <Field label="Relation">
                                    <Input value={form.emergencyContact.relation} onChange={(v) => updateContact('relation', v)} placeholder="e.g. Spouse" />
                                </Field>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mx-10 bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-600">
                            {error}
                        </div>
                    )}

                    <div className="px-10 py-6 border-t border-slate-100 flex justify-between gap-3 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-12 px-8 rounded-2xl bg-synclly-coral text-white font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, required, full, children }) {
    return (
        <div className={`space-y-2 ${full ? 'col-span-2' : ''}`}>
            <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">
                {label}
                {required && <span className="text-synclly-coral ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}

function Input({ type = 'text', value, onChange, placeholder, ...rest }) {
    return (
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-medium text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all"
            {...rest}
        />
    );
}

function Select({ value, onChange, options, placeholder }) {
    const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o || placeholder || '\u2014' } : o));
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-medium text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all appearance-none cursor-pointer"
        >
            {opts.map((o) => (
                <option key={`${o.value}-${o.label}`} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}
