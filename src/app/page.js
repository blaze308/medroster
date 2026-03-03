'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [timetables, setTimetables] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const res = await fetch('/api/timetables');
      const data = await res.json();
      setTimetables(data);
    } catch (error) {
      console.error('Failed to fetch timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    try {
      const res = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          weekStart: monday.toISOString(),
          weekEnd: sunday.toISOString(),
        }),
      });
      const newTt = await res.json();
      window.location.href = `/timetable/${newTt.id}`;
    } catch (error) {
      console.error('Failed to create timetable:', error);
    }
  };

  return (
    <div className="min-h-screen bg-synclly-surface text-synclly-deep overflow-hidden">
      {/* Synclly Style Hero Section */}
      <div className="relative pt-24 pb-48 px-8 max-w-7xl mx-auto flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-synclly-coral/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] -z-10" />

        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-100 text-synclly-coral text-[11px] font-extrabold uppercase tracking-widest mb-10 shadow-sm animate-in fade-in slide-in-from-top-10 duration-1000">
          <span className="w-1.5 h-1.5 rounded-full bg-synclly-coral animate-pulse" />
          Modern Hospital Rostering
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05] text-center max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 px-4">
          The smart way for <br />
          <span className="text-synclly-coral italic">scheduling.</span>
        </h1>

        <p className="text-synclly-muted text-lg md:text-xl max-w-2xl mx-auto mb-16 text-center font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          Synclly-inspired MedRoster simplifies hospital rotation management with Ghanaian ingenuity and high-end design.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary px-10 py-5 text-lg shadow-synclly-lg hover:-translate-y-1 transition-transform"
          >
            Create Hospital Timetable
          </button>
          <div className="flex items-center gap-4 text-synclly-muted font-bold text-sm">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-[3px] border-synclly-surface bg-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              ))}
            </div>
            <span>Trusted by 50+ Facilities</span>
          </div>
        </div>
      </div>

      {/* Rosters Section */}
      <div className="max-w-7xl mx-auto px-8 -mt-24 pb-48 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight">Active Rosters</h2>
            <p className="text-synclly-muted font-medium">Continue managing your facility's rotation schedules.</p>
          </div>
          <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-xs font-bold text-synclly-muted shadow-sm flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-synclly-coral" />
            {timetables.length} Timetables
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-white border-t-synclly-coral rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {timetables.map((tt) => (
              <Link
                href={`/timetable/${tt.id}`}
                key={tt.id}
                className="group glass-panel rounded-[32px] p-8 transition-all hover:-translate-y-2 hover:shadow-synclly-lg"
              >
                <div className="flex items-start justify-between mb-12">
                  <div className="w-14 h-14 bg-synclly-surface text-synclly-muted rounded-[20px] flex items-center justify-center text-xl font-extrabold transition-all group-hover:bg-synclly-coral group-hover:text-white border border-slate-50 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-synclly-coral/20">
                    {tt.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-synclly-deep mb-3 truncate transition-colors group-hover:text-synclly-coral">{tt.name}</h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-sm font-bold text-synclly-muted opacity-80">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-40"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <span className="tabular-nums">
                      {new Date(tt.weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} — {new Date(tt.weekEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-synclly-surface p-4 rounded-2xl flex flex-col items-start gap-1">
                      <span className="text-2xl font-extrabold text-synclly-deep">{tt._count?.staff || 0}</span>
                      <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Personnel</span>
                    </div>
                    <div className="bg-synclly-surface p-4 rounded-2xl flex flex-col items-start gap-1">
                      <span className="text-2xl font-extrabold text-synclly-deep">{tt._count?.assignments || 0}</span>
                      <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Shifts</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* New Roster Button */}
            <button
              onClick={() => setShowModal(true)}
              className="group flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 transition-all hover:bg-white hover:border-synclly-coral/40 hover:shadow-synclly-lg hover:-translate-y-2"
            >
              <div className="w-16 h-16 rounded-[22px] bg-synclly-surface border border-slate-50 flex items-center justify-center text-slate-300 mb-6 transition-all group-hover:bg-synclly-coral group-hover:text-white shadow-sm ring-8 ring-transparent group-hover:ring-synclly-coral/5 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-synclly-coral/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <span className="text-xl font-extrabold text-slate-400 group-hover:text-synclly-deep transition-colors tracking-tight">New Roster Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
            <div className="p-12">
              <h2 className="text-3xl font-extrabold text-synclly-deep tracking-tight mb-3">Facility Roster</h2>
              <p className="text-synclly-muted font-medium mb-12 leading-relaxed">Ready to automate your hospital shifts? Give your roster a name to get started.</p>

              <form onSubmit={handleCreate} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest ml-1">Hospital or Ward Name</label>
                  <input
                    autoFocus
                    required
                    className="w-full h-16 bg-synclly-surface border border-slate-50 rounded-2xl px-6 text-xl font-extrabold text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral transition-all"
                    placeholder="e.g. Korle Bu Ward 4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-14 rounded-2xl bg-white border border-slate-100 text-synclly-muted font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] h-14 bg-synclly-coral text-white rounded-2xl font-bold text-sm hover:bg-synclly-coral-hover shadow-xl shadow-synclly-coral/20 transition-all active:scale-95"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
