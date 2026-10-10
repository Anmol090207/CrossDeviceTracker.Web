import { useState } from "react";
import DailyChart from "../components/DailyChart";
import { ErrorBanner, SampleNotice, StatSkeleton } from "../components/Feedback";
import { IconDownload } from "../components/icons";
import PageHeader from "../components/PageHeader";
import SelectMenu from "../components/SelectMenu";
import StatGrid from "../components/StatGrid";
import UsageRow from "../components/UsageRow";
import { useTracker } from "../hooks/useTracker";
import { appsFor, exportTracker } from "../utils/exportData";
import { REPORT_RANGE_OPTIONS } from "../utils/time";

const DEVICE_COLORS = {
  mobile: "#dbeafe",
  desktop: "#ede9fe",
  tablet: "#f3f4f6",
};

export default function Reports() {
  const [range, setRange] = useState("7d");
  const { data, status, error, reload, isSample, isStale } = useTracker(range);
  const apps = appsFor(data);
  const deviceTotal = (data?.devices ?? []).reduce((sum, device) => sum + (device.durationSeconds || 0), 0);

  return (
    <section className={`page ${isStale ? "is-stale" : ""}`}>
      <PageHeader title="Reports" subtitle="Screen time across days, weeks, and months">
        <SelectMenu label="Report range" value={range} options={REPORT_RANGE_OPTIONS} onChange={setRange} />
        <button type="button" className="btn-primary" onClick={() => exportTracker(data, "crosstime-report.csv")} disabled={!data}>
          <IconDownload />
          Export
        </button>
      </PageHeader>
      {isSample && <SampleNotice />}
      {error && <ErrorBanner message={error.message} onRetry={reload} />}
      {status === "loading" && !data && <StatSkeleton />}
      {data && (
        <>
          <StatGrid stats={data.stats} />
          <div className="dashboard-grid">
            <section className="panel">
              <header className="panel-header">
                <h2>Daily</h2>
              </header>
              <DailyChart days={data.daily ?? []} emptyTitle="No daily totals yet." />
            </section>
            <section className="panel">
              <header className="panel-header">
                <h2>By Device</h2>
              </header>
              <div className="usage-list">
                {(data.devices ?? []).map((device) => (
                  <UsageRow
                    key={device.id}
                    color={DEVICE_COLORS[device.formFactor] || "#e5e7eb"}
                    title={device.name}
                    seconds={device.durationSeconds}
                    percentage={deviceTotal ? (device.durationSeconds / deviceTotal) * 100 : 0}
                    meta={`${device.platform} • ${device.formFactor}`}
                  />
                ))}
              </div>
            </section>
          </div>
          <div className="dashboard-grid report-periods">
            <section className="panel">
              <header className="panel-header">
                <h2>Weekly</h2>
              </header>
              <DailyChart days={data.weekly ?? []} emptyTitle="No weekly totals yet." />
            </section>
            <section className="panel">
              <header className="panel-header">
                <h2>Monthly</h2>
              </header>
              <DailyChart days={data.monthly ?? []} emptyTitle="No monthly totals yet." />
            </section>
          </div>
          <section className="panel report-apps">
            <header className="panel-header">
              <h2>Applications</h2>
            </header>
            <div className="usage-list usage-list--grid">
              {apps.map((app) => (
                <UsageRow
                  key={app.name}
                  color={app.color}
                  title={app.name}
                  seconds={app.seconds}
                  percentage={app.percentage}
                  meta={app.devices?.length ? `Used on: ${app.devices.join(", ")}` : null}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
