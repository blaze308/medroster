'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HospitalSidebar from './HospitalSidebar';
import DepartmentsTab from './DepartmentsTab';
import StaffTab from './StaffTab';
import SchedulesTab from './SchedulesTab';

const TABS = [
    { id: 'departments', label: 'Departments' },
    { id: 'staff', label: 'Staff' },
    { id: 'schedules', label: 'Schedules' },
];

export default function HospitalDashboard({ hospitalId }) {
    const router = useRouter();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('departments');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchHospital = useCallback(async () => {
        try {
            const res = await fetch(`/api/hospitals/${hospitalId}`);
            if (!res.ok) {
                router.push('/');
                return;
            }
            const data = await res.json();
            // First-time visit with no departments? Redirect to setup.
            if (!data.departments || data.departments.length === 0) {
                router.replace(`/hospital/${hospitalId}/setup`);
                return;
            }
            setHospital(data);
        } catch {
            router.push('/');
        } finally {
            setLoading(false);
        }
    }, [hospitalId, router]);

    useEffect(() => {
        fetchHospital();
    }, [fetchHospital]);

    if (loading || !hospital) {
        return (
            <div className="flex items-center justify-center h-screen bg-synclly-surface">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-synclly-coral rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-synclly-surface overflow-hidden text-synclly-deep">
            <HospitalSidebar
                hospital={hospital}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={TABS}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <header className="px-10 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-synclly-muted uppercase tracking-widest">
                            {hospital.type} · {hospital.region}
                        </p>
                        <h1>{hospital.name}</h1>
                    </div>

                    <div className="h-10 bg-white border border-slate-200 rounded-2xl flex p-1 shadow-synclly overflow-hidden">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 text-[11px] font-bold rounded-xl transition-all ${
                                    activeTab === t.id
                                        ? 'bg-synclly-surface text-synclly-deep'
                                        : 'text-synclly-muted hover:text-synclly-deep'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="px-10 pb-20 flex-1 flex flex-col min-h-0">
                    {activeTab === 'departments' && (
                        <DepartmentsTab hospital={hospital} onChange={fetchHospital} />
                    )}
                    {activeTab === 'staff' && (
                        <StaffTab hospital={hospital} onChange={fetchHospital} />
                    )}
                    {activeTab === 'schedules' && (
                        <SchedulesTab hospital={hospital} />
                    )}
                </main>
            </div>
        </div>
    );
}
