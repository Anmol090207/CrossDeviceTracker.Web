import { boundsQuery } from "../utils/time";
import { request } from "./http";

/**
 * CrossTime API.
 *
 * GET
 *   /api/analytics/daily
 *   /api/analytics/weekly
 *   /api/analytics/monthly
 *   /api/analytics/hourly
 *   /api/dashboard/summary
 *   /api/dashboard/apps
 *   /api/dashboard/devices
 *   /api/dashboard/timeline
 *   /api/devices
 *   /api/timelogs
 *
 * POST
 *   /api/auth/register          { email, password }
 *   /api/auth/token             { email, password }
 *   /api/devices                { deviceName, platform, installationId }
 *   /api/devices/link-token
 *   /api/devices/link           { linkToken, deviceName, platform }
 *   /api/timelogs               { packageName, appName, startTimeUtc, endTimeUtc, durationSeconds, createdAtUtc }
 *   /api/timelogs/batch         [same object]
 */

export function registerAccount(email, password) {
  return request("/api/auth/register", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export function login(email, password) {
  return request("/api/auth/token", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export function fetchDevices(options) {
  return request("/api/devices", options);
}

export function createDevice({ deviceName, platform, installationId }, options) {
  return request("/api/devices", {
    method: "POST",
    body: { deviceName, platform, installationId },
    ...options,
  });
}

export function createLinkToken(options) {
  return request("/api/devices/link-token", { method: "POST", ...options });
}

export function linkDevice({ linkToken, deviceName, platform }, options) {
  return request("/api/devices/link", {
    method: "POST",
    auth: false,
    body: { linkToken, deviceName, platform },
    ...options,
  });
}

export function fetchSummary(options) {
  return request("/api/dashboard/summary", options);
}

export function fetchAppUsage(bounds, { deviceId, platform, ...options } = {}) {
  const params = new URLSearchParams();
  if (bounds?.from) params.set("from", bounds.from);
  if (bounds?.to) params.set("to", bounds.to);
  if (deviceId && deviceId !== "all") params.set("deviceId", deviceId);
  if (platform) params.set("platform", platform);
  const query = params.size ? `?${params}` : "";
  return request(`/api/dashboard/apps${query}`, options);
}

export function fetchDeviceUsage(bounds, options) {
  return request(`/api/dashboard/devices${boundsQuery(bounds)}`, options);
}

export function fetchTimeline(bounds, options) {
  return request(`/api/dashboard/timeline${boundsQuery(bounds)}`, options);
}

export function fetchHourlyUsage(bounds, options) {
  return request(`/api/analytics/hourly${boundsQuery(bounds)}`, options);
}

export function fetchDailyUsage(bounds, options) {
  return request(`/api/analytics/daily${boundsQuery(bounds)}`, options);
}

export function fetchWeeklyUsage(bounds, options) {
  return request(`/api/analytics/weekly${boundsQuery(bounds)}`, options);
}

export function fetchMonthlyUsage(bounds, options) {
  return request(`/api/analytics/monthly${boundsQuery(bounds)}`, options);
}

export function fetchTimeLogs({ limit = 50, cursor } = {}, options) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return request(`/api/timelogs?${params}`, options);
}

export function createTimeLog(entry, options) {
  return request("/api/timelogs", {
    method: "POST",
    body: timeLogBody(entry),
    ...options,
  });
}

export function createTimeLogsBatch(entries, options) {
  return request("/api/timelogs/batch", {
    method: "POST",
    body: entries.map(timeLogBody),
    ...options,
  });
}

function timeLogBody(entry) {
  return {
    packageName: entry.packageName ?? "",
    appName: entry.appName,
    startTimeUtc: entry.startTimeUtc,
    endTimeUtc: entry.endTimeUtc,
    durationSeconds: entry.durationSeconds,
    createdAtUtc: entry.createdAtUtc ?? new Date().toISOString(),
  };
}
