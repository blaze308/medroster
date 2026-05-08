'use client';

import { useMemo } from 'react';
import { isStaffOnLeave, classifyStaffType } from '../../lib/staff-utils';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeek(weekStart) {
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
    });
}

export default function CalendarGrid({ weekStart, staff, assignments, onCellClick, onManageLeave }) {
    const days = useMemo(() => buildWeek(weekStart), [weekStart]);

    const assignmentLookup = useMemo(() => {
        const map = new Map();
        for (const a of assignments) {
            const key = `${String(a.staffId)}_${new Date(a.date).toISOString().split('T')[0]}`;
            map.set(key, a);
        }
        return map;
    }, [assignments]);

    if (staff.length === 0) {
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-synclly">
                <h3 className="text-lg font-extrabold text-synclly-deep mb-1">No staff in this view</h3>
                <p className="text-synclly-muted font-medium text-sm">
                    Add staff or pick a different department to start scheduling.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-synclly overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-synclly-surface">
                            <th className="text-left p-4 text-[10px] font-bold text-synclly-muted uppercase tracking-widest sticky left-0 bg-synclly-surface z-10 min-w-[260px]">
                                Staff
                            </th>
                            {days.map((d, i) => (
                                <th key={i} className="p-3 min-w-[120px]">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest">{DAY_NAMES[i]}</span>
                                        <span className="text-base font-extrabold text-synclly-deep">{d.getDate()}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((s) => {
                            const type = s.staffType || classifyStaffType(s.rank);
                            const initials = `${s.firstName[0] || ''}${s.lastName[0] || ''}`.toUpperCase();
                            return (
                                <tr key={s._id} className="border-t border-slate-50 hover:bg-synclly-surface/40 transition-colors">
                                    <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-synclly-coral/10 text-synclly-coral flex items-center justify-center font-extrabold text-xs shrink-0">
                                                {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-extrabold text-synclly-deep truncate">{s.firstName} {s.lastName}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-synclly-muted font-bold uppercase tracking-wider truncate">
                                                        {s.rank || s.category}
                                                    </span>
                                                    {type === 'pno' && (
                                                        <span className="text-[8px] font-extrabold uppercase tracking-widest px-1 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">PNO+</span>
                                                    )}
                                                    {type === 'senior' && (
                                                        <span className="text-[8px] font-extrabold uppercase tracking-widest px-1 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">SR</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onManageLeave?.(s)}
                                                className="text-[10px] font-bold text-synclly-muted hover:text-synclly-coral transition-colors"
                                                title="Manage leave"
                                            >
                                                Leave
                                            </button>
                                        </div>
                                    </td>
                                    {days.map((d, i) => {
                                        const onLeave = isStaffOnLeave(s, d);
                                        const key = `${s._id}_${d.toISOString().split('T')[0]}`;
                                        const a = assignmentLookup.get(key);

                                        return (
                                            <td key={i} className="p-2">
                                                <button
                                                    type="button"
                                                    disabled={onLeave}
                                                    onClick={() => onCellClick(s, d)}
                                                    className={`w-full h-14 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                                                        onLeave
                                                            ? 'bg-amber-50/40 border-amber-100 text-amber-500 cursor-not-allowed'
                                                            : a
                                                            ? 'bg-white border-slate-100 hover:border-synclly-coral hover:shadow-sm'
                                                            : 'bg-synclly-surface border-transparent hover:border-synclly-coral/30 hover:bg-white'
                                                    }`}
                                                >
                                                    {onLeave ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">On Leave</span>
                                                    ) : a ? (
                                                        <span className={`shift-block ${a.shiftType?.color || ''}`}>
                                                            {a.shiftType?.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 text-lg">+</span>
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
