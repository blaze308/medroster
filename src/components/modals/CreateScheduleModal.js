'use client';

import { useState } from 'react';

function getMondayOfThisWeek() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
}

export default function CreateScheduleModal({ hospitalId, onClose, onCreated }) {
    const [weekStart, setWeekStart] = useState(getMondayOfThisWeek());
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weekStart, name: name.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create schedule');
                return;
            }
            onCreated(data);
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <form onSubmit={handleSubmit} className="p-10">
                    <h2 className="text-2xl font-extrabold text-synclly-deep tracking-tight mb-2">New Schedule</h2>
                    <p className="text-synclly-muted font-medium text-sm mb-6">
                        Pick the Monday of the week you want to roster.
                    </p>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Week Starting</label>
                            <input
                                type="date"
                                required
                                value={weekStart}
                                onChange={(e) => setWeekStart(e.target.value)}
                                className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Label (optional)</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Easter week roster"
                                className="w-full h-12 bg-synclly-surface border border-slate-100 rounded-xl px-4 text-sm font-medium text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-600">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 h-12 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] h-12 rounded-2xl bg-synclly-coral text-white font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
