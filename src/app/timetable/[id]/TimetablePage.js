'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import CalendarGrid from './CalendarGrid';
import StaffListView from './StaffListView';
import AddStaffModal from './AddStaffModal';
import ShiftPicker from './ShiftPicker';

export default function TimetablePage() {
    const { id } = useParams();
    const router = useRouter();
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('calendar');
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [shiftPicker, setShiftPicker] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchTimetable = useCallback(async () => {
        try {
            const res = await fetch(`/api/timetables/${id}`);
            if (!res.ok) {
                router.push('/');
                return;
            }
            const data = await res.json();
            setTimetable(data);
            setLoading(false);
        } catch {
            router.push('/');
        }
    }, [id, router]);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    const handleAssignShift = async (staffId, date, shiftTypeId) => {
        try {
            await fetch(`/api/timetables/${id}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId, shiftTypeId, date }),
            });
            await fetchTimetable();
            setShiftPicker(null);
        } catch (err) {
            console.error('Failed to assign shift', err);
        }
    };

    const handleRemoveShift = async (staffId, date) => {
        try {
            await fetch(`/api/timetables/${id}/assignments?staffId=${staffId}&date=${date}`, {
                method: 'DELETE',
            });
            await fetchTimetable();
            setShiftPicker(null);
        } catch (err) {
            console.error('Failed to remove shift', err);
        }
    };

    const handleAddStaff = async (staffData) => {
        try {
            await fetch(`/api/timetables/${id}/staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(staffData),
            });
            await fetchTimetable();
            setShowAddStaff(false);
        } catch (err) {
            console.error('Failed to add staff', err);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        try {
            await fetch(`/api/timetables/${id}/staff?staffId=${staffId}`, {
                method: 'DELETE',
            });
            await fetchTimetable();
        } catch (err) {
            console.error('Failed to delete staff', err);
        }
    };

    const handleGenerate = async () => {
        if (!confirm('This will replace all current shift assignments. Continue?')) return;
        setGenerating(true);
        try {
            const res = await fetch(`/api/timetables/${id}/generate`, { method: 'POST' });
            const data = await res.json();
            setTimetable(data);
        } catch (err) {
            console.error('Failed to generate', err);
        }
        setGenerating(false);
    };

    const handleCellClick = (staffId, date, event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setShiftPicker({
            staffId,
            date,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-synclly-surface">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-synclly-coral rounded-full animate-spin" />
            </div>
        );
    }

    const weekDates = [];
    const start = new Date(timetable.weekStart);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        weekDates.push(d);
    }

    const assignmentMap = {};
    (timetable.assignments || []).forEach((a) => {
        const dateStr = new Date(a.date).toISOString().split('T')[0];
        const key = `${a.staffId}_${dateStr}`;
        assignmentMap[key] = a;
    });

    const departments = [...new Set((timetable.staff || []).map((s) => s.department))];
    const totalStaff = (timetable.staff || []).length;
    const currentMonth = new Date(timetable.weekStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="flex h-screen bg-synclly-surface overflow-hidden text-synclly-deep">
            <Sidebar
                timetable={timetable}
                departments={departments}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Synclly Style Header */}
                <header className="px-10 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1>{activeTab === 'calendar' ? 'Calendar' : 'Personnel'}</h1>
                        <p className="text-sm font-medium text-synclly-muted max-w-lg">
                            {activeTab === 'calendar'
                                ? `Manage your hospital's rotation for ${timetable.name}. Ensure all departments are fully staffed.`
                                : `Manage medical staff records and department assignments for ${timetable.name}.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Integration Button */}
                        <button className="hidden lg:btn bg-white text-synclly-deep border border-slate-200 hover:bg-slate-50 shadow-sm text-xs py-2 px-4 shadow-synclly">
                            <span className="w-5 h-5 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </span>
                            Sync Calendar
                        </button>

                        <div className="hidden sm:flex -space-x-2 mr-2">
                            {[...Array(Math.min(totalStaff, 4))].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-[3px] border-synclly-surface bg-white flex items-center justify-center text-[10px] font-bold text-synclly-muted transition-transform hover:scale-110 cursor-pointer shadow-sm">
                                    {i === 3 && totalStaff > 4 ? `+${totalStaff - 3}` : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary shadow-synclly text-xs py-2"
                            onClick={() => (activeTab === 'calendar' ? handleGenerate() : setShowAddStaff(true))}
                        >
                            {activeTab === 'calendar' ? (
                                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Auto-Plan Roster</>
                            ) : (
                                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> New Staff Member</>
                            )}
                        </button>
                    </div>
                </header>

                {/* Sub-Header Actions */}
                <div className="px-10 pb-8 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-700">
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-synclly-deep hover:bg-slate-50 transition-all shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button className="px-2 py-2 flex items-center gap-2 text-xl font-extrabold text-synclly-deep hover:text-synclly-coral transition-colors">
                            {currentMonth}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                        <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-synclly-deep hover:bg-slate-50 transition-all shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="btn-secondary py-2 px-4 shadow-synclly flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            Filter
                        </button>
                        <div className="h-10 bg-white border border-slate-200 rounded-2xl flex p-1 shadow-synclly overflow-hidden">
                            <button className="px-4 text-[11px] font-bold rounded-xl bg-synclly-surface text-synclly-deep">Month</button>
                            <button className="px-4 text-[11px] font-bold rounded-xl text-synclly-muted hover:text-synclly-deep">Week</button>
                        </div>
                    </div>
                </div>

                {/* Main Workspace */}
                <main className="px-10 pb-20 flex-1 flex flex-col min-h-0">
                    {activeTab === 'calendar' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex-1 flex flex-col">
                            <CalendarGrid
                                staff={timetable.staff}
                                weekDates={weekDates}
                                assignmentMap={assignmentMap}
                                shiftTypes={timetable.shiftTypes}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    ) : (
                        <StaffListView
                            staff={timetable.staff}
                            departments={departments}
                            onDeleteStaff={handleDeleteStaff}
                            onAddStaff={() => setShowAddStaff(true)}
                        />
                    )}
                </main>
            </div>

            {shiftPicker && (
                <ShiftPicker
                    shiftTypes={timetable.shiftTypes}
                    currentAssignment={assignmentMap[`${shiftPicker.staffId}_${new Date(shiftPicker.date).toISOString().split('T')[0]}`]}
                    position={{ x: shiftPicker.x, y: shiftPicker.y }}
                    onSelect={(shiftTypeId) => handleAssignShift(shiftPicker.staffId, shiftPicker.date, shiftTypeId)}
                    onRemove={() => handleRemoveShift(shiftPicker.staffId, shiftPicker.date)}
                    onClose={() => setShiftPicker(null)}
                />
            )}

            {showAddStaff && (
                <AddStaffModal
                    departments={departments}
                    onSubmit={handleAddStaff}
                    onClose={() => setShowAddStaff(false)}
                />
            )}
        </div>
    );
}
