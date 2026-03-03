'use client';

import { useState } from 'react';

export default function StaffListView({ staff, departments, onDeleteStaff, onAddStaff }) {
  const [filter, setFilter] = useState('All');

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

  const getColors = (dept) => DEPT_COLORS[dept] || '#94A3B8';

  const filteredStaff = filter === 'All'
    ? staff
    : staff.filter(s => s.department === filter);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Friendly Filter Navigation */}
      <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <button
          className={`px-6 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${filter === 'All' ? 'bg-synclly-deep border-synclly-deep text-white shadow-lg' : 'bg-white border-slate-100 text-synclly-muted hover:border-slate-200 hover:text-synclly-deep shadow-sm'}`}
          onClick={() => setFilter('All')}
        >
          All Personnel ({staff.length})
        </button>
        {departments.map(dept => (
          <button
            key={dept}
            className={`px-6 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border flex items-center gap-2.5 ${filter === dept ? 'bg-synclly-deep border-synclly-deep text-white shadow-lg' : 'bg-white border-slate-100 text-synclly-muted hover:border-slate-200 hover:text-synclly-deep shadow-sm'}`}
            onClick={() => setFilter(dept)}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColors(dept) }} />
            {dept}
          </button>
        ))}
      </div>

      {/* Grid of Synclly Profile Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
        {filteredStaff.map((s) => (
          <div key={s.id} className="group relative bg-white rounded-[32px] border border-slate-50 p-8 flex flex-col gap-6 transition-all hover:shadow-synclly-lg hover:-translate-y-1">
            {/* Top Row: Name & Role Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-xl leading-tight mb-1 truncate">{s.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest">{s.role}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Verified
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-synclly-surface flex items-center justify-center text-synclly-muted transition-colors group-hover:bg-synclly-coral/10 group-hover:text-synclly-coral">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            </div>

            {/* Middle Section: Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-6 border-y border-slate-50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColors(s.department) }} />
                  <span className="text-xs font-bold text-synclly-deep">{s.department}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Active duty</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                <p className="text-xs font-bold text-synclly-deep">Accra, Ghana</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Email</p>
                <p className="text-xs font-bold text-synclly-deep truncate opacity-60">med@{s.name.split(' ')[0].toLowerCase()}.gh</p>
              </div>
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-2xl bg-white border border-slate-100 text-[11px] font-bold text-synclly-muted hover:bg-slate-50 hover:text-synclly-deep transition-all shadow-sm"
                onClick={() => alert('Profile insights coming soon.')}
              >
                View Profile
              </button>
              <button
                className="flex-1 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-[11px] font-bold text-rose-500 hover:bg-rose-100 transition-all shadow-sm"
                onClick={() => { if (confirm(`Confirm detachment of ${s.name}?`)) onDeleteStaff(s.id) }}
              >
                Detach Member
              </button>
            </div>

            {/* Hover Delete 'X' */}
            <button
              className="absolute top-4 right-4 p-2 text-slate-200 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-90 hover:scale-110"
              onClick={() => { if (confirm(`Remove ${s.name}?`)) onDeleteStaff(s.id) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[40px] border border-slate-100 shadow-synclly">
          <div className="w-20 h-20 bg-synclly-surface rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">🔍</div>
          <h3 className="text-xl font-extrabold text-synclly-deep">No personnel found</h3>
          <p className="text-synclly-muted text-sm font-medium max-w-xs mt-2">Try adjusting your filters or enroll a new staff member to populate this view.</p>
        </div>
      )}
    </div>
  );
}
