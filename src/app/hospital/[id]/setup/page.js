'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DepartmentTemplatePicker from '../../../../components/modals/DepartmentTemplatePicker';

export default function HospitalSetupPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch(`/api/hospitals/${id}`);
                if (!res.ok) {
                    router.push('/');
                    return;
                }
                const data = await res.json();
                if (!active) return;
                // If departments already exist, skip setup
                if (data.departments && data.departments.length > 0) {
                    router.replace(`/hospital/${id}`);
                    return;
                }
                setHospital(data);
            } catch {
                router.push('/');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [id, router]);

    const handleSave = async (departments) => {
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`/api/hospitals/${id}/departments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ departments }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save departments');
                return;
            }
            router.push(`/hospital/${id}`);
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-synclly-surface">
                <div className="w-12 h-12 border-4 border-white border-t-synclly-coral rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!hospital) return null;

    return (
        <div className="min-h-screen bg-synclly-surface text-synclly-deep py-16 px-6">
            <div className="max-w-4xl mx-auto mb-10">
                <button
                    onClick={() => router.push('/')}
                    className="text-xs font-bold text-synclly-muted hover:text-synclly-coral transition-colors mb-6 flex items-center gap-2"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    BACK TO HOSPITALS
                </button>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1">{hospital.name}</h1>
                <p className="text-synclly-muted font-medium text-sm">
                    {hospital.type} · {hospital.region}
                </p>
            </div>

            <DepartmentTemplatePicker
                onSave={handleSave}
                onSkip={() => router.push(`/hospital/${id}`)}
                busy={busy}
                error={error}
            />
        </div>
    );
}
