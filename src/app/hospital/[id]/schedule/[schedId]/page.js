import SchedulePage from '../../../../../components/schedule/SchedulePage';

export default async function ScheduleRoute({ params }) {
    const { id, schedId } = await params;
    return <SchedulePage hospitalId={id} scheduleId={schedId} />;
}
