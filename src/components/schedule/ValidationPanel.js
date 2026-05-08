'use client';

import { useCallback, useEffect, useState } from 'react';

const TYPE_LABEL = {
    leave_conflict: 'Leave conflict',
    role_shift_incompatible: 'Role restriction',
    supervisory_coverage: 'Coverage',
    max_hours: 'Hours',
};

export default function ValidationPanel({ hospitalId, scheduleId, dataVersion }) {
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);

    const validate = useCallback(async () => {
        setBusy(true);
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}/schedules/${scheduleId}/validate`, {
                method: 'POST',
            });
            if (res.ok) setResult(await res.json());
        } finally {
            setBusy(false);
        }
    }, [hospitalId, scheduleId]);

    useEffect(() => {
        validate();
    }, [validate, dataVersion]);

    if (!result) return null;

    const errorCount = result.summary?.totalErrors || 0;
    const warningCount = result.summary?.totalWarnings || 0;
    const isValid = errorCount === 0;

    return (
        <div className="fixed bottom-6 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)]">
            <div className={`bg-white rounded-[24px] border shadow-synclly-lg overflow-hidden transition-all ${
                isValid ? 'border-emerald-100' : 'border-rose-100'
            }`}>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="w-full p-5 flex items-center justify-between gap-3 hover:bg-slate-50/50"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isValid ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                            {isValid ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-extrabold text-synclly-deep">
                                {isValid ? 'Schedule valid' : `${errorCount} ${errorCount === 1 ? 'issue' : 'issues'}`}
                            </p>
                            <p className="text-[11px] font-bold text-synclly-muted uppercase tracking-wider">
                                {warningCount > 0 ? `${warningCount} warning${warningCount === 1 ? '' : 's'}` : 'Real-time check'}
                            </p>
                        </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-synclly-muted transition-transform ${open ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (errorCount > 0 || warningCount > 0) && (
                    <div className="border-t border-slate-100 max-h-72 overflow-y-auto">
                        {result.errors?.map((e, i) => (
                            <div key={`e${i}`} className="px-5 py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-start gap-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 shrink-0 mt-0.5">
                                        {TYPE_LABEL[e.type] || e.type}
                                    </span>
                                    <p className="text-xs font-bold text-synclly-deep leading-snug">{e.message}</p>
                                </div>
                            </div>
                        ))}
                        {result.warnings?.map((w, i) => (
                            <div key={`w${i}`} className="px-5 py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-start gap-2">
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 shrink-0 mt-0.5">
                                        {TYPE_LABEL[w.type] || w.type}
                                    </span>
                                    <p className="text-xs font-bold text-synclly-deep leading-snug">{w.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={validate}
                    disabled={busy}
                    className="w-full py-2.5 text-[10px] font-bold text-synclly-muted uppercase tracking-widest border-t border-slate-50 hover:bg-slate-50/50 disabled:opacity-50"
                >
                    {busy ? 'Validating...' : 'Re-validate'}
                </button>
            </div>
        </div>
    );
}
