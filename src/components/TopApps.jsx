import SelectMenu from "./SelectMenu";
import UsageRow from "./UsageRow";
import { EmptyState } from "./Feedback";

export default function TopApps({ apps, devices, deviceId, onDeviceChange }) {
  const options = [
    { value: "all", label: "All Devices" },
    ...devices.map((device) => ({ value: device.id, label: device.name })),
  ];

  return (
    <section className="panel apps-panel">
      <header className="panel-header">
        <h2>Top Applications</h2>
        <SelectMenu label="Filter applications by device" value={deviceId} options={options} onChange={onDeviceChange} />
      </header>
      {apps.length === 0 ? (
        <EmptyState title="No application usage yet." detail="App time shows up after a device syncs a session." />
      ) : (
        <div className="usage-list">
          {apps.slice(0, 6).map((app) => (
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
      )}
    </section>
  );
}
