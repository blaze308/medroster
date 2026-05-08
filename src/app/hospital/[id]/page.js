import HospitalDashboard from '../../../components/hospital/HospitalDashboard';

export default async function HospitalPage({ params }) {
    const { id } = await params;
    return <HospitalDashboard hospitalId={id} />;
}
