'use client';

import { useState } from 'react';

export default function AddStaffModal({ departments, onSubmit, onClose }) {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('');
    const [customDept, setCustomDept] = useState('');
    const [customRole, setCustomRole] = useState('');

    const commonRoles = ['Nurse', 'Senior Nurse', 'Doctor', 'Specialist', 'Radiographer', 'Pharmacist', 'Lab Technician'];
    const commonDepts = departments.length > 0 ? departments : ['Emergency', 'ICU', 'Pediatrics', 'Surgery', 'Maternity', 'Outpatient'];

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalDept = department === 'custom' ? customDept : department;
        const finalRole = role === 'custom' ? customRole : role;

        if (name && finalDept && finalRole) {
            onSubmit({ name, department: finalDept, role: finalRole });
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-synclly-lg p-0 border border-slate-50 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">

                {/* Header */}
                <div className="px-10 py-10 flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-synclly-deep leading-tight">Enroll Personnel</h2>
                        <p className="text-sm font-medium text-synclly-muted">Register a medical professional to this roster.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-synclly-muted hover:bg-slate-50 hover:text-synclly-deep transition-all"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-8">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1 opacity-70">Staff Full Name</label>
                        <input
                            autoFocus
                            required
                            className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-6 text-sm font-bold text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all"
                            placeholder="e.g. Dr. Kwame Asante"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Department Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1 opacity-70">Assigned Department</label>
                        <select
                            required
                            className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-6 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all appearance-none cursor-pointer"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        >
                            <option value="">Choose Department</option>
                            {commonDepts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                            <option value="custom">+ Create New Department</option>
                        </select>
                        {department === 'custom' && (
                            <input
                                autoFocus
                                className="w-full h-12 bg-white border-2 border-synclly-coral/20 rounded-2xl px-6 text-sm font-bold text-synclly-coral mt-4 animate-in slide-in-from-top-3 shadow-inner"
                                placeholder="Name the Department"
                                value={customDept}
                                onChange={(e) => setCustomDept(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Role Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1 opacity-70">Professional Designation</label>
                        <select
                            required
                            className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-6 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all appearance-none cursor-pointer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">Choose Role</option>
                            {commonRoles.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                            <option value="custom">+ Create New Role</option>
                        </select>
                        {role === 'custom' && (
                            <input
                                autoFocus
                                className="w-full h-12 bg-white border-2 border-synclly-coral/20 rounded-2xl px-6 text-sm font-bold text-synclly-coral mt-4 animate-in slide-in-from-top-3 shadow-inner"
                                placeholder="Enter Job Title"
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50 hover:text-synclly-deep transition-all shadow-sm active:scale-95"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] h-14 rounded-2xl bg-synclly-coral text-white font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 transition-all active:scale-95 translate-y-0"
                        >
                            Enroll Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
