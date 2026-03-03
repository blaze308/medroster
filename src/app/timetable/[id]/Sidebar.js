'use client';

export default function Sidebar({ timetable, departments, activeTab, onTabChange, isOpen, onToggle }) {
    const getColor = (dept) => {
        const DEPT_COLORS = {
            'Emergency': '#FF5C39',
            'ICU': '#A855F7',
            'Pediatrics': '#0EA5E9',
            'Surgery': '#10B981',
            'Pharmacy': '#F59E0B',
            'Radiology': '#EC4899',
            'Maternity': '#F97316',
            'Outpatient': '#06B6D4',
        };
        return DEPT_COLORS[dept] || '#94A3B8';
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-100 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand / Logo */}
                <div className="p-6 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-synclly-coral rounded-xl flex items-center justify-center text-white shadow-lg shadow-synclly-coral/20">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-extrabold text-synclly-deep leading-tight">MedRoster</span>
                        <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Hospital Manager</span>
                    </div>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto px-4 space-y-8">

                    {/* Main Section */}
                    <div className="space-y-1">
                        <h4 className="px-4 mb-4">Navigation</h4>

                        <button
                            className={`w-full sidebar-item ${activeTab === 'calendar' ? 'sidebar-item-active' : 'text-synclly-muted hover:bg-slate-50'}`}
                            onClick={() => onTabChange('calendar')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Calendar
                        </button>

                        <button
                            className={`w-full sidebar-item ${activeTab === 'staff' ? 'sidebar-item-active' : 'text-synclly-muted hover:bg-slate-50'}`}
                            onClick={() => onTabChange('staff')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Personnel Hub
                        </button>

                        <button className="w-full sidebar-item text-synclly-muted hover:bg-slate-50">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Settings
                        </button>
                    </div>

                    {/* Departments Section */}
                    <div className="space-y-1">
                        <h4 className="px-4 mb-4">Departments</h4>
                        <div className="space-y-1">
                            {departments.map((dept) => (
                                <div key={dept} className="sidebar-item text-synclly-muted hover:bg-slate-50 cursor-pointer">
                                    <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: getColor(dept) }}>
                                        {dept.charAt(0)}
                                    </div>
                                    <span className="flex-1 truncate text-[13px]">{dept}</span>
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                                        {timetable.staff.filter((s) => s.department === dept).length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / User Profile Card - Synclly Style */}
                <div className="p-4 border-t border-slate-50">
                    <div className="p-3 bg-synclly-surface rounded-2xl flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-synclly-coral/10 flex items-center justify-center text-synclly-coral">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-synclly-deep truncate">Administrator</p>
                            <p className="text-[10px] font-medium text-synclly-muted truncate">admin@medroster.gh</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
