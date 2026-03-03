'use client';

import { useEffect, useRef } from 'react';

export default function ShiftPicker({ shiftTypes, currentAssignment, position, onSelect, onRemove, onClose }) {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position to prevent overflow
    let left = position.x;
    let top = position.y;

    if (typeof window !== 'undefined') {
        if (left + 240 > window.innerWidth) left = window.innerWidth - 260;
        if (top + 320 > window.innerHeight) top = window.innerHeight - 340;
    }

    const getIcon = (color) => {
        if (color === 'morning') return (
            <div className="w-8 h-8 rounded-xl bg-[#FFF1E6] text-[#FF9A3E] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
            </div>
        );
        if (color === 'afternoon') return (
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
            </div>
        );
        return (
            <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] text-[#A855F7] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
            </div>
        );
    };

    return (
        <div
            ref={pickerRef}
            className="fixed z-[100] w-[240px] bg-white rounded-[24px] shadow-synclly-lg border border-slate-50 p-3 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: `${left}px`, top: `${top}px` }}
        >
            <div className="px-4 py-3 border-b border-slate-50 mb-2">
                <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest">Assign Shift</span>
            </div>

            <div className="space-y-1">
                {shiftTypes.map((st) => {
                    const isSelected = currentAssignment?.shiftTypeId === st.id;
                    return (
                        <button
                            key={st.id}
                            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all group ${isSelected ? 'bg-synclly-surface border border-slate-100' : 'hover:bg-synclly-surface text-synclly-deep'}`}
                            onClick={() => onSelect(st.id)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {getIcon(st.color)}
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[13px] font-bold truncate leading-none mb-1">{st.name}</span>
                                    <span className="text-[10px] font-medium text-synclly-muted opacity-60 leading-none">{st.startTime}</span>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-synclly-coral mr-2" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-50">
                <button
                    className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    onClick={onRemove}
                >
                    <div className="w-8 h-8 rounded-xl bg-white border border-rose-100 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </div>
                    Remove Assignment
                </button>
            </div>
        </div>
    );
}
