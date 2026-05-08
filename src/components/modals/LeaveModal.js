'use client';

import { useState } from 'react';
import { LEAVE_TYPES } from '../../lib/ghana-data';

export default function LeaveModal({ hospitalId, staff, onClose, onSaved }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaveType, setLeaveType] = useState('Annual');
    const [notes, setNotes] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [busyDeleteId, setBusyDeleteId] = useState(null);

    const records = (staff.leaveRecords || []).slice().sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            setError('Both dates are required');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}/staff/${staff._id}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate, leaveType, notes }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to add leave');
                return;
            }
            setStartDate('');
            setEndDate('');
            setNotes('');
            onSaved?.();
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (leaveId) => {
        setBusyDeleteId(leaveId);
        try {
            const res = await fetch(
                `/api/hospitals/${hospitalId}/staff/${staff._id}/leave?leaveId=${leaveId}`,
                { method: 'DELETE' }
            );
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to remove leave');
                return;
            }
            onSaved?.();
        } catch (err) {
            alert(err.message || 'Network error');
        } finally {
            setBusyDeleteId(null);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
                <div className="px-10 pt-10 pb-6 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest mb-2">
                        Manage Leave · Annual balance: {staff.annualLeaveBalance ?? 15} days
                    </p>
                    <h2 className="text-2xl font-extrabold text-synclly-deep tracking-tight">
                        {staff.firstName} {staff.lastName}
                    </h2>
                </div>

                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleAdd} className="px-10 py-6 space-y-4 border-b border-slate-100">
                        <h3 className="text-sm font-extrabold text-synclly-deep">Add New Leave</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Type</label>
                                <select
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral cursor-pointer"
                                >
                                    {LEAVE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Notes (optional)</label>
                                <input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-medium text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-600">
                                {error}
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs font-bold text-amber-700 flex items-start gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Any shift assignments inside this leave window will be removed automatically.
                        </div>

                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full h-12 rounded-2xl bg-synclly-coral text-white font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 disabled:opacity-50"
                        >
                            {busy ? 'Adding...' : 'Add Leave'}
                        </button>
                    </form>

                    <div className="px-10 py-6">
                        <h3 className="text-sm font-extrabold text-synclly-deep mb-4">Existing Leave ({records.length})</h3>
                        {records.length === 0 ? (
                            <p className="text-synclly-muted text-sm font-medium">No leave records yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {records.map((r) => (
                                    <div key={r._id} className="flex items-center justify-between p-3 bg-synclly-surface rounded-2xl">
                                        <div>
                                            <div className="text-sm font-extrabold text-synclly-deep">
                                                {formatDate(r.startDate)} → {formatDate(r.endDate)}
                                            </div>
                                            <div className="text-[11px] text-synclly-muted font-bold uppercase tracking-wider mt-0.5">
                                                {r.leaveType}{r.notes ? ` · ${r.notes}` : ''}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={busyDeleteId === r._id}
                                            onClick={() => handleDelete(r._id)}
                                            className="text-rose-400 hover:text-rose-500 hover:bg-rose-50 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-50"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-10 py-4 border-t border-slate-100 sticky bottom-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
