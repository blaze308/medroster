'use client';

export default function CalendarGrid({ staff, weekDates, assignmentMap, shiftTypes, onCellClick }) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().toISOString().split('T')[0];

    const getShiftIcon = (color) => {
        if (color === 'morning') return (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#FF9A3E] shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            </div>
        );
        if (color === 'afternoon') return (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#0EA5E9] shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            </div>
        );
        return (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#A855F7] shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            </div>
        );
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-synclly-lg overflow-hidden">
            <div className="overflow-x-auto flex-1 scrollbar-hide">
                <table className="w-full border-collapse table-fixed">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm p-6 text-left w-64 border-r border-slate-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
                                <h4 className="pl-2">Medical Staff</h4>
                            </th>
                            {weekDates.map((date, i) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const isToday = dateStr === today;
                                return (
                                    <th key={i} className="p-4 min-w-[160px] text-center">
                                        <div className={`inline-flex flex-col items-center p-3 rounded-2xl transition-all ${isToday ? 'bg-synclly-surface border border-slate-100' : ''}`}>
                                            <span className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-synclly-coral' : 'text-synclly-muted'}`}>
                                                {days[i]}
                                            </span>
                                            <span className={`text-xl font-extrabold ${isToday ? 'text-synclly-deep' : 'text-slate-400'}`}>
                                                {date.getDate().toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {staff.map((member) => (
                            <tr key={member.id} className="group hover:bg-synclly-surface/30 transition-colors">
                                <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm group-hover:bg-synclly-surface/50 p-6 border-r border-slate-100 shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-colors">
                                    <div className="flex items-center gap-4 min-w-0 pr-4">
                                        <div className="w-10 h-10 rounded-xl bg-synclly-surface text-synclly-muted flex items-center justify-center text-xs font-bold shrink-0 transition-all border border-slate-100 group-hover:bg-white group-hover:text-synclly-deep group-hover:shadow-sm">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[13px] font-bold text-synclly-deep truncate tracking-tight">{member.name}</div>
                                            <div className="text-[10px] font-bold text-synclly-muted uppercase tracking-tighter opacity-70 group-hover:opacity-100 mt-0.5">{member.role}</div>
                                        </div>
                                    </div>
                                </td>
                                {weekDates.map((date, i) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const assignment = assignmentMap[`${member.id}_dateStr` === `${member.id}_${dateStr}` ? `${member.id}_${dateStr}` : `${member.id}_${dateStr}`]; // Standardizing key access

                                    return (
                                        <td
                                            key={i}
                                            className="p-1 h-[90px] cursor-pointer group/cell border-r border-slate-50/50 last:border-r-0"
                                            onClick={(e) => onCellClick(member.id, date, e)}
                                        >
                                            <div className="w-full h-full rounded-2xl transition-all flex items-center justify-center group-hover/cell:bg-white/50">
                                                {assignment ? (
                                                    <div
                                                        className={`shift-block rounded-full w-[94%] mx-auto shadow-sm transform transition-all group-hover/cell:scale-[1.05] group-hover/cell:shadow-md ${assignment.shiftType?.color === 'morning' ? 'morning' :
                                                            assignment.shiftType?.color === 'afternoon' ? 'afternoon' :
                                                                'night'
                                                            }`}
                                                    >
                                                        {getShiftIcon(assignment.shiftType?.color)}
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="truncate leading-none mb-0.5">{assignment.shiftType?.name}</span>
                                                            <span className="text-[9px] opacity-60 font-medium lowercase tracking-normal leading-none">{assignment.shiftType?.startTime}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="opacity-0 group-hover/cell:opacity-100 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-100 text-slate-300 hover:text-synclly-coral hover:border-synclly-coral shadow-sm transition-all transform hover:scale-110">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
