import { useState } from "react";
import { IconDownload } from "../components/icons";
import PageHeader from "../components/PageHeader";
import SelectMenu from "../components/SelectMenu";
import StatGrid from "../components/StatGrid";
import SyncChip from "../components/SyncChip";
import TopApps from "../components/TopApps";
import UsageChart from "../components/UsageChart";
import { ErrorBanner, SampleNotice, StatSkeleton } from "../components/Feedback";
import { useTracker } from "../hooks/useTracker";
import { appsFor, exportTracker } from "../utils/exportData";
import { RANGE_OPTIONS } from "../utils/time";

export default function Dashboard() {
  const [range, setRange] = useState("today");
  const [deviceId, setDeviceId] = useState("all");
  const { data, status, error, reload, isSample, isStale } = useTracker(range);
  const apps = appsFor(data, deviceId);

  return (
    <section className={`page ${isStale ? "is-stale" : ""}`} aria-busy={status === "loading"}>
      <PageHeader title="Dashboard" subtitle="Track your cross-device screen time">
        <SelectMenu label="Date range" value={range} options={RANGE_OPTIONS} onChange={setRange} />
        <SyncChip sync={data?.sync} loading={status === "loading"} onRefresh={reload} />
        <button type="button" className="btn-primary" onClick={() => exportTracker(data, "crosstime-dashboard.csv")} disabled={!data}>
          <IconDownload />
          Export
        </button>
      </PageHeader>
      {isSample && <SampleNotice />}
      {error && <ErrorBanner message={error.message} onRetry={reload} />}
      {status === "loading" && !data ? (
        <StatSkeleton />
      ) : (
        data && (
          <>
            <StatGrid stats={data.stats} />
            <div className="dashboard-grid">
              <UsageChart hourly={data.hourly} mode={data.chartMode} />
              <TopApps apps={apps} devices={data.devices} deviceId={deviceId} onDeviceChange={setDeviceId} />
            </div>
          </>
        )
      )}
    </section>
  );
}
