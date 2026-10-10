const DESKTOP = ["mac", "win", "linux", "desktop", "ubuntu", "chromeos"];
const TABLET = ["ipad", "tablet"];

export const ONLINE_WINDOW_MS = 30 * 60 * 1000;

export function classifyFormFactor(platform = "", deviceName = "") {
  const blob = `${platform} ${deviceName}`.toLowerCase();
  if (TABLET.some((token) => blob.includes(token))) return "tablet";
  if (DESKTOP.some((token) => blob.includes(token))) return "desktop";
  return "mobile";
}

export function usageFamily(formFactor) {
  return formFactor === "desktop" ? "desktop" : "mobile";
}

export function isDeviceOnline(lastSyncAt, isRevoked, now = Date.now()) {
  if (isRevoked || !lastSyncAt) return false;
  const syncedAt = new Date(lastSyncAt).getTime();
  if (Number.isNaN(syncedAt)) return false;
  return now - syncedAt <= ONLINE_WINDOW_MS;
}

export function deviceMeta(device) {
  const platform = String(device.platform || "unknown").toLowerCase();
  return `${platform} • ${device.formFactor}`;
}
