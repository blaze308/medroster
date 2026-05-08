'use client';

import { useState } from 'react';
import DepartmentTemplatePicker from '../modals/DepartmentTemplatePicker';

export default function DepartmentsTab({ hospital, onChange }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const departments = hospital.departments || [];

    const handleAddBulk = async (deps) => {
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/hospitals/${hospital._id}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ departments: deps }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to add departments');
                return;
            }
            setShowAdd(false);
            await onChange();
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setBusy(false);
        }
    };

    const startEdit = (dept) => {
        setEditingId(dept._id);
        setEditName(dept.name);
        setEditDesc(dept.description || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditDesc('');
    };

    const saveEdit = async (depId) => {
        if (!editName.trim()) return;
        try {
            const res = await fetch(`/api/hospitals/${hospital._id}/departments/${depId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to update');
                return;
            }
            cancelEdit();
            await onChange();
        } catch (err) {
            alert(err.message || 'Network error');
        }
    };

    const handleDelete = async (dept) => {
        if (!confirm(`Delete ${dept.name}? Staff in this department must be moved first.`)) return;
        try {
            const res = await fetch(`/api/hospitals/${hospital._id}/departments/${dept._id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
                return;
            }
            await onChange();
        } catch (err) {
            alert(err.message || 'Network error');
        }
    };

    if (showAdd) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DepartmentTemplatePicker
                    onSave={handleAddBulk}
                    onSkip={() => setShowAdd(false)}
                    busy={busy}
                    error={error}
                />
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">{departments.length} {departments.length === 1 ? 'Department' : 'Departments'}</h2>
                    <p className="text-synclly-muted font-medium text-sm mt-1">Wards and units active at this facility.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="btn btn-primary text-xs py-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Departments
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {departments.map((d) => {
                    const isEditing = editingId === d._id;
                    return (
                        <div key={d._id} className="group bg-white rounded-[24px] border border-slate-50 p-6 transition-all hover:shadow-synclly hover:-translate-y-0.5">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full h-11 bg-synclly-surface border border-slate-100 rounded-xl px-3 text-sm font-bold text-synclly-deep focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                                    />
                                    <input
                                        value={editDesc}
                                        onChange={(e) => setEditDesc(e.target.value)}
                                        placeholder="Description"
                                        className="w-full h-11 bg-synclly-surface border border-slate-100 rounded-xl px-3 text-sm font-medium text-synclly-deep placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-synclly-coral/5 focus:border-synclly-coral"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={cancelEdit} className="flex-1 h-10 rounded-xl bg-white border border-slate-200 text-synclly-muted text-xs font-bold hover:bg-slate-50">Cancel</button>
                                        <button onClick={() => saveEdit(d._id)} className="flex-1 h-10 rounded-xl bg-synclly-coral text-white text-xs font-bold hover:bg-synclly-coral-hover">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="text-lg font-extrabold text-synclly-deep leading-tight">{d.name}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(d)}
                                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-synclly-coral hover:bg-synclly-coral/5 flex items-center justify-center"
                                                title="Edit"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d)}
                                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center"
                                                title="Delete"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-synclly-muted font-medium leading-relaxed min-h-[2.5em]">
                                        {d.description || 'No description'}
                                    </p>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {departments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-synclly">
                    <h3 className="text-xl font-extrabold text-synclly-deep">No departments yet</h3>
                    <p className="text-synclly-muted text-sm font-medium max-w-xs mt-2 mb-6">Add departments before you start enrolling staff.</p>
                    <button onClick={() => setShowAdd(true)} className="btn btn-primary text-xs py-2">
                        Add Departments
                    </button>
                </div>
            )}
        </div>
    );
}
