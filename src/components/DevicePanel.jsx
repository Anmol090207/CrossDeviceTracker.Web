import { deviceMeta } from "../utils/platform";
import { formatRelative } from "../utils/time";
import { EmptyState } from "./Feedback";
import { FormFactorIcon, IconPlus, IconWifi } from "./icons";

function DeviceCard({ device }) {
  return (
    <article className={`device-card device-card--${device.formFactor} ${device.online ? "is-online" : "is-offline"}`}>
      <span className="device-glyph">
        <FormFactorIcon formFactor={device.formFactor} />
      </span>
      <div className="device-copy">
        <div className="device-name-row">
          <h3>{device.name}</h3>
          <span className="device-presence" aria-label={device.online ? "Online" : "Offline"}>
            <i className="presence-dot" />
            <IconWifi />
          </span>
        </div>
        <p>
          {device.online ? "Online" : "Offline"} • Last sync:{" "}
          {device.lastSyncAt ? formatRelative(device.lastSyncAt) : "never"}
        </p>
        <p className="device-platform">{deviceMeta(device)}</p>
      </div>
    </article>
  );
}

export default function DevicePanel({ devices, onAdd }) {
  return (
    <section className="panel devices-panel">
      <header className="panel-header devices-panel-header">
        <h2>
          Connected
          <br />
          Devices
        </h2>
        <button type="button" className="add-device-button" onClick={onAdd}>
          <IconPlus />
          Add Device
        </button>
      </header>
      {devices.length === 0 ? (
        <EmptyState
          title="No devices connected."
          detail="Generate a link token and enter it in the desktop app."
          action={
            <button type="button" className="btn-primary" onClick={onAdd}>
              Add Device
            </button>
          }
        />
      ) : (
        <div className="device-list">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </section>
  );
}
