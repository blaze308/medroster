'use client';

import Link from 'next/link';

export default function HospitalSidebar({ hospital, activeTab, onTabChange, tabs, isOpen, onToggle }) {
    const departments = hospital.departments || [];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onToggle}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Link href="/" className="p-6 mb-2 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="w-10 h-10 bg-synclly-coral rounded-xl flex items-center justify-center text-white shadow-lg shadow-synclly-coral/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-extrabold text-synclly-deep leading-tight">MedRoster</span>
                        <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">All Hospitals</span>
                    </div>
                </Link>

                <div className="flex-1 overflow-y-auto px-4 space-y-8">
                    <div className="space-y-1">
                        <h4 className="px-4 mb-4">Manage</h4>
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                className={`w-full sidebar-item ${activeTab === t.id ? 'sidebar-item-active' : 'text-synclly-muted hover:bg-slate-50'}`}
                                onClick={() => onTabChange(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {departments.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="px-4 mb-4">Departments</h4>
                            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                                {departments.map((d) => (
                                    <div
                                        key={d._id}
                                        className="sidebar-item text-synclly-muted text-[12px]"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-synclly-coral/60" />
                                        <span className="flex-1 truncate">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-50">
                    <div className="p-3 bg-synclly-surface rounded-2xl">
                        <p className="text-xs font-bold text-synclly-deep truncate">{hospital.name}</p>
                        <p className="text-[10px] font-medium text-synclly-muted truncate">{hospital.region}</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
