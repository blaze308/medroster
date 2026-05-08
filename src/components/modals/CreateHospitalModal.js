'use client';

import { useState } from 'react';
import { HOSPITAL_TYPES, GHANA_REGIONS } from '../../lib/ghana-data';

export default function CreateHospitalModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('District Hospital');
    const [region, setRegion] = useState('Greater Accra');
    const [location, setLocation] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/hospitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), type, region, location: location.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to register hospital');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
                <div className="p-10">
                    <h2 className="text-3xl font-extrabold text-synclly-deep tracking-tight mb-3">Register Hospital</h2>
                    <p className="text-synclly-muted font-medium mb-8 leading-relaxed">
                        We'll set you up with default shifts and walk you through adding departments next.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Hospital Name</label>
                            <input
                                autoFocus
                                required
                                className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-5 text-base font-bold text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all"
                                placeholder="e.g. Korle Bu Teaching Hospital"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all appearance-none cursor-pointer"
                                >
                                    {HOSPITAL_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Region</label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-4 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all appearance-none cursor-pointer"
                                >
                                    {GHANA_REGIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">City / Town (optional)</label>
                            <input
                                className="w-full h-14 bg-synclly-surface border border-slate-100 rounded-2xl px-5 text-sm font-bold text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all"
                                placeholder="e.g. Accra"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-xs font-bold text-rose-600">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-[2] h-14 bg-synclly-coral text-white rounded-2xl font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Creating...' : 'Continue to Setup'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
