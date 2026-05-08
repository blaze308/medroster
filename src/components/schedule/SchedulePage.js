'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CalendarGrid from './CalendarGrid';
import ShiftPicker from './ShiftPicker';
import ValidationPanel from './ValidationPanel';
import SettingsModal from './SettingsModal';
import LeaveModal from '../modals/LeaveModal';

function formatRange(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function SchedulePage({ hospitalId, scheduleId }) {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [picker, setPicker] = useState(null); // { staff, date, currentShiftTypeId }
    const [showSettings, setShowSettings] = useState(false);
    const [leaveStaff, setLeaveStaff] = useState(null);
    const [activeDeptId, setActiveDeptId] = useState('all');
    const [generating, setGenerating] = useState(false);
    const [statusToast, setStatusToast] = useState(null); // { kind: 'success' | 'error', message }

    const fetchSchedule = useCallback(async () => {
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}/schedules/${scheduleId}`);
            if (!res.ok) {
                router.push(`/hospital/${hospitalId}`);
                return;
            }
            const fetched = await res.json();
            setData(fetched);
        } finally {
            setLoading(false);
        }
    }, [hospitalId, scheduleId, router]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    useEffect(() => {
        if (!statusToast) return;
        const t = setTimeout(() => setStatusToast(null), 4000);
        return () => clearTimeout(t);
    }, [statusToast]);

    const filteredStaff = useMemo(() => {
        if (!data) return [];
        if (activeDeptId === 'all') return data.staff;
        return data.staff.filter((s) => String(s.departmentId) === activeDeptId);
    }, [data, activeDeptId]);

    const handleCellClick = (staff, date) => {
        if (!data) return;
        const existing = data.assignments.find(
            (a) => String(a.staffId) === String(staff._id) && new Date(a.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
        const currentShiftType = existing?.shiftType;
        const matchedTypeId = currentShiftType
            ? data.hospital.shiftTypes.find((st) => st.name === currentShiftType.name)?._id
            : null;
        setPicker({ staff, date, currentShiftTypeId: matchedTypeId, currentShiftType });
    };

    const handleAssign = async (shiftTypeId) => {
        if (!picker) return;
        const { staff, date } = picker;
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}/schedules/${scheduleId}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staffId: staff._id,
                    date: date.toISOString(),
                    shiftTypeId: shiftTypeId || null,
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                setStatusToast({ kind: 'error', message: result.errors?.join('; ') || result.error || 'Validation failed' });
                return;
            }
            setPicker(null);
            await fetchSchedule();
            if (result.warnings?.length > 0) {
                setStatusToast({ kind: 'warning', message: result.warnings.join('; ') });
            } else {
                setStatusToast({ kind: 'success', message: shiftTypeId ? 'Shift assigned' : 'Shift cleared' });
            }
        } catch (err) {
            setStatusToast({ kind: 'error', message: err.message || 'Network error' });
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Clear every assignment in this schedule?')) return;
        await fetch(`/api/hospitals/${hospitalId}/schedules/${scheduleId}/assignments?clearAll=true`, {
            method: 'DELETE',
        });
        await fetchSchedule();
        setStatusToast({ kind: 'success', message: 'All assignments cleared' });
    };

    const handleGenerate = async () => {
        if (!confirm('Auto-generate will replace existing assignments. Continue?')) return;
        setGenerating(true);
        try {
            const body = activeDeptId !== 'all' ? { departmentIds: [activeDeptId] } : {};
            const res = await fetch(`/api/hospitals/${hospitalId}/schedules/${scheduleId}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (!res.ok) {
                setStatusToast({ kind: 'error', message: result.error || 'Generation failed' });
                return;
            }
            await fetchSchedule();
            setStatusToast({
                kind: 'success',
                message: `Generated ${result.assignmentsCreated} assignments across ${result.staffConsidered} staff`,
            });
        } catch (err) {
            setStatusToast({ kind: 'error', message: err.message || 'Network error' });
        } finally {
            setGenerating(false);
        }
    };

    const handleSettingsSaved = async (newSettings) => {
        const res = await fetch(`/api/hospitals/${hospitalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: newSettings }),
        });
        if (res.ok) {
            await fetchSchedule();
            setShowSettings(false);
            setStatusToast({ kind: 'success', message: 'Settings updated' });
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-synclly-surface">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-synclly-coral rounded-full animate-spin" />
            </div>
        );
    }

    const { schedule, hospital, departments, assignments } = data;

    return (
        <div className="min-h-screen bg-synclly-surface text-synclly-deep">
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="px-6 md:px-10 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/hospital/${hospitalId}`)}
                            className="w-10 h-10 rounded-xl bg-synclly-surface text-synclly-muted hover:text-synclly-coral flex items-center justify-center transition-all"
                            aria-label="Back"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div>
                            <p className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest">{hospital.name}</p>
                            <h1 className="text-xl font-extrabold tracking-tight">
                                {schedule.name || 'Weekly Schedule'} · {formatRange(schedule.weekStart, schedule.weekEnd)}
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="h-10 px-5 rounded-xl bg-synclly-coral text-white text-xs font-bold hover:bg-synclly-coral-hover shadow-md shadow-synclly-coral/10 flex items-center gap-2 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>Auto-Generate</>
                            )}
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-synclly-muted text-xs font-bold hover:bg-slate-50"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-synclly-muted hover:text-synclly-coral flex items-center justify-center"
                            aria-label="Settings"
                            title="Settings"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Department filter chips */}
                <div className="px-6 md:px-10 pb-3 flex gap-2 overflow-x-auto -mx-1 px-1">
                    <button
                        onClick={() => setActiveDeptId('all')}
                        className={`shrink-0 h-8 px-3 rounded-lg text-[11px] font-bold transition-all ${
                            activeDeptId === 'all'
                                ? 'bg-synclly-coral text-white'
                                : 'bg-synclly-surface text-synclly-muted hover:text-synclly-deep'
                        }`}
                    >
                        All Staff
                    </button>
                    {departments.map((d) => (
                        <button
                            key={d._id}
                            onClick={() => setActiveDeptId(d._id)}
                            className={`shrink-0 h-8 px-3 rounded-lg text-[11px] font-bold transition-all ${
                                activeDeptId === d._id
                                    ? 'bg-synclly-coral text-white'
                                    : 'bg-synclly-surface text-synclly-muted hover:text-synclly-deep'
                            }`}
                        >
                            {d.name}
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 md:px-10 py-6">
                <CalendarGrid
                    weekStart={schedule.weekStart}
                    staff={filteredStaff}
                    assignments={assignments}
                    onCellClick={handleCellClick}
                    onManageLeave={(s) => setLeaveStaff(s)}
                />
            </main>

            <ValidationPanel hospitalId={hospitalId} scheduleId={scheduleId} dataVersion={data.assignments.length} />

            {picker && (
                <ShiftPicker
                    staff={picker.staff}
                    date={picker.date}
                    shiftTypes={hospital.shiftTypes}
                    currentShiftTypeId={picker.currentShiftTypeId}
                    onAssign={handleAssign}
                    onClose={() => setPicker(null)}
                />
            )}

            {showSettings && (
                <SettingsModal
                    settings={hospital.settings}
                    onSave={handleSettingsSaved}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {leaveStaff && (
                <LeaveModal
                    hospitalId={hospitalId}
                    staff={leaveStaff}
                    onClose={() => setLeaveStaff(null)}
                    onSaved={async () => {
                        await fetchSchedule();
                        const res = await fetch(`/api/hospitals/${hospitalId}/staff/${leaveStaff._id}`);
                        if (res.ok) setLeaveStaff(await res.json());
                    }}
                />
            )}

            {statusToast && (
                <div
                    className={`fixed top-24 right-6 z-50 max-w-md px-5 py-3 rounded-2xl shadow-synclly-lg border text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${
                        statusToast.kind === 'error'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : statusToast.kind === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                >
                    {statusToast.message}
                </div>
            )}
        </div>
    );
}
