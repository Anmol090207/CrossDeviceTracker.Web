import { useMemo, useState } from "react";
import ActivityList, { ActivityHeader } from "../components/ActivityList";
import { ErrorBanner, SampleNotice, StatSkeleton } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import SelectMenu from "../components/SelectMenu";
import { useTracker } from "../hooks/useTracker";
import { visibleActivity } from "../services/tracker";
import { RANGE_OPTIONS } from "../utils/time";

export default function Timeline() {
  const [range, setRange] = useState("today");
  const [deviceId, setDeviceId] = useState("all");
  const { data, status, error, reload, isSample, isStale } = useTracker(range);
  const items = useMemo(
    () => visibleActivity(data, { deviceId }),
    [data, deviceId],
  );
  const deviceOptions = [
    { value: "all", label: "All Devices" },
    ...(data?.devices ?? []).map((device) => ({ value: device.id, label: device.name })),
  ];

  return (
    <section className={`page ${isStale ? "is-stale" : ""}`}>
      <PageHeader title="Timeline" subtitle="Activity across every linked device">
        <SelectMenu label="Date range" value={range} options={RANGE_OPTIONS} onChange={setRange} />
        <SelectMenu label="Device" value={deviceId} options={deviceOptions} onChange={setDeviceId} />
      </PageHeader>
      {isSample && <SampleNotice />}
      {error && <ErrorBanner message={error.message} onRetry={reload} />}
      {status === "loading" && !data ? (
        <StatSkeleton />
      ) : (
      <section className="panel">
        <ActivityHeader />
        <ActivityList items={items} grouped />
        {data?.integration && <p className="integration-note">{data.integration}</p>}
      </section>
      )}
    </section>
  );
}
