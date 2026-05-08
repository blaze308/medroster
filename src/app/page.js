'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CreateHospitalModal from '../components/modals/CreateHospitalModal';

export default function LandingPage() {
  const [hospitals, setHospitals] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (newHospital) => {
    // Send the user straight to the setup wizard for the new hospital
    window.location.href = `/hospital/${newHospital._id}/setup`;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hospitals/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete hospital');
      } else {
        setHospitals((prev) => prev.filter((h) => h._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('Failed to delete hospital:', error);
      alert('Failed to delete hospital');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-synclly-surface text-synclly-deep overflow-hidden">
      {/* Hero */}
      <div className="relative pt-24 pb-48 px-8 max-w-7xl mx-auto flex flex-col items-center">
        <div className="absolute top-20 -left-20 w-[600px] h-[600px] bg-synclly-coral/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[100px] -z-10" />

        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-100 text-synclly-coral text-[11px] font-extrabold uppercase tracking-widest mb-10 shadow-sm animate-in fade-in slide-in-from-top-10 duration-1000">
          <span className="w-1.5 h-1.5 rounded-full bg-synclly-coral animate-pulse" />
          Ghana Hospital Rostering
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05] text-center max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100 px-4">
          Built for the way <br />
          <span className="text-synclly-coral italic">Ghana hospitals</span> work.
        </h1>

        <p className="text-synclly-muted text-lg md:text-xl max-w-2xl mx-auto mb-16 text-center font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
          MedRoster handles departments, ranks, PIN/AIN licensing, and Labour Act leave so your duty roster respects the rules.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary px-10 py-5 text-lg shadow-synclly-lg hover:-translate-y-1 transition-transform"
          >
            Register a Hospital
          </button>
        </div>
      </div>

      {/* Hospitals list */}
      <div className="max-w-7xl mx-auto px-8 -mt-24 pb-48 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight">Registered Hospitals</h2>
            <p className="text-synclly-muted font-medium">Manage facilities, staff, and weekly rosters from one dashboard.</p>
          </div>
          <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-xs font-bold text-synclly-muted shadow-sm flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-synclly-coral" />
            {hospitals.length} {hospitals.length === 1 ? 'Hospital' : 'Hospitals'}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-white border-t-synclly-coral rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {hospitals.map((h) => (
              <div key={h._id} className="relative group">
                <Link
                  href={`/hospital/${h._id}`}
                  className="block glass-panel rounded-[32px] p-8 transition-all hover:-translate-y-2 hover:shadow-synclly-lg"
                >
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-14 h-14 bg-synclly-surface text-synclly-muted rounded-[20px] flex items-center justify-center text-xl font-extrabold transition-all group-hover:bg-synclly-coral group-hover:text-white border border-slate-50 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-synclly-coral/20">
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-extrabold text-synclly-deep mb-2 truncate transition-colors group-hover:text-synclly-coral">{h.name}</h3>
                  <p className="text-xs font-bold text-synclly-muted uppercase tracking-widest mb-8">
                    {h.type} · {h.region}
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-synclly-surface p-4 rounded-2xl flex flex-col items-start gap-1">
                      <span className="text-2xl font-extrabold text-synclly-deep">{h.counts?.departments || 0}</span>
                      <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Depts</span>
                    </div>
                    <div className="bg-synclly-surface p-4 rounded-2xl flex flex-col items-start gap-1">
                      <span className="text-2xl font-extrabold text-synclly-deep">{h.counts?.staff || 0}</span>
                      <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Staff</span>
                    </div>
                    <div className="bg-synclly-surface p-4 rounded-2xl flex flex-col items-start gap-1">
                      <span className="text-2xl font-extrabold text-synclly-deep">{h.counts?.schedules || 0}</span>
                      <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Weeks</span>
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(h);
                  }}
                  aria-label={`Delete ${h.name}`}
                  title="Delete hospital"
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowCreate(true)}
              className="group flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 transition-all hover:bg-white hover:border-synclly-coral/40 hover:shadow-synclly-lg hover:-translate-y-2"
            >
              <div className="w-16 h-16 rounded-[22px] bg-synclly-surface border border-slate-50 flex items-center justify-center text-slate-300 mb-6 transition-all group-hover:bg-synclly-coral group-hover:text-white shadow-sm ring-8 ring-transparent group-hover:ring-synclly-coral/5 group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-synclly-coral/20">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </div>
              <span className="text-xl font-extrabold text-slate-400 group-hover:text-synclly-deep transition-colors tracking-tight">Register Hospital</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-synclly-lg border border-slate-50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="p-10">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <h2 className="text-2xl font-extrabold text-synclly-deep tracking-tight mb-3">Delete Hospital?</h2>
              <p className="text-synclly-muted font-medium mb-6 leading-relaxed">
                You're about to permanently delete <span className="font-extrabold text-synclly-deep">{deleteTarget.name}</span>. This will remove all departments, staff, leave records, and schedule history.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-synclly-surface p-3 rounded-2xl flex flex-col items-start gap-1">
                  <span className="text-lg font-extrabold text-synclly-deep">{deleteTarget.counts?.departments || 0}</span>
                  <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Depts</span>
                </div>
                <div className="bg-synclly-surface p-3 rounded-2xl flex flex-col items-start gap-1">
                  <span className="text-lg font-extrabold text-synclly-deep">{deleteTarget.counts?.staff || 0}</span>
                  <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Staff</span>
                </div>
                <div className="bg-synclly-surface p-3 rounded-2xl flex flex-col items-start gap-1">
                  <span className="text-lg font-extrabold text-synclly-deep">{deleteTarget.counts?.schedules || 0}</span>
                  <span className="text-[10px] font-bold text-synclly-muted uppercase tracking-wider">Weeks</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 text-synclly-muted font-bold text-sm hover:bg-slate-50 hover:text-synclly-deep transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-[2] h-14 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateHospitalModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
