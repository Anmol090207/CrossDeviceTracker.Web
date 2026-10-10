import { aggregateApps } from "../services/metrics";
import { SAMPLE_APPS } from "../services/sampleData";
import { downloadCsv } from "./csv";
import { formatDuration, formatPercent } from "./time";

export function appsFor(model, deviceId = "all") {
  if (!model) return [];
  if (model.source === "sample" && deviceId === "all") return SAMPLE_APPS;
  if (model.sessions?.length) return aggregateApps(model.sessions, deviceId);
  if (deviceId === "all") return model.apps || [];
  return [];
}

export function exportTracker(model, filename) {
  if (!model) return;
  const apps = appsFor(model);
  downloadCsv(filename, [
    ["Metric", "Value", "Detail"],
    ...model.stats.map((stat) => [stat.label, stat.value, stat.hint]),
    [],
    ["Device", "Platform", "Status", "Last sync"],
    ...model.devices.map((device) => [
      device.name,
      device.platform,
      device.online ? "Online" : "Offline",
      device.lastSyncAt || "",
    ]),
    [],
    ["Application", "Duration", "Share", "Devices"],
    ...apps.map((app) => [
      app.name,
      formatDuration(app.seconds),
      formatPercent(app.percentage),
      app.devices.join(", "),
    ]),
  ]);
}
