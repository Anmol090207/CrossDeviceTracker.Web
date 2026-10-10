import { pick } from "../utils/object";
import { rangeBounds } from "../utils/time";
import {
  fetchAppUsage,
  fetchDailyUsage,
  fetchDeviceUsage,
  fetchDevices,
  fetchHourlyUsage,
  fetchMonthlyUsage,
  fetchSummary,
  fetchTimeLogs,
  fetchTimeline,
  fetchWeeklyUsage,
} from "./api";
import {
  aggregateApps,
  applySummaryStats,
  appsFromApi,
  buildActivity,
  buildDaily,
  buildHourly,
  buildStats,
  createModel,
  dailyFromAnalytics,
  filterSessions,
  hourlyFromAnalytics,
  mergeDevices,
  monthlyFromAnalytics,
  normalizeDevice,
  sessionsFromLogs,
  sessionsFromTimeline,
  syncStatus,
  weeklyFromAnalytics,
} from "./metrics";
import { buildSampleModel } from "./sampleData";
import { getAccessToken } from "./session";

async function attempt(work) {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    if (error.name === "AbortError" || error.status === 401) throw error;
    return { ok: false, error };
  }
}

async function readTimeLogs(bounds, options) {
  const items = [];
  let cursor = null;

  for (let page = 0; page < 4; page += 1) {
    const payload = await fetchTimeLogs({ limit: 50, cursor }, options);
    const batch = payload?.items || payload?.Items || [];
    items.push(...batch);
    const hasMore = Boolean(payload?.hasMore || payload?.HasMore);
    const next = payload?.nextCursor || payload?.NextCursor;
    if (!hasMore || !next || !batch.length) break;
    const oldest = pick(batch.at(-1), "startTime", "StartTime");
    if (oldest && new Date(oldest) < bounds.start) break;
    cursor = next;
  }

  return items;
}

function listPayload(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.devices || payload?.Devices || [];
}

export async function loadTracker(range, { signal, fresh = false } = {}) {
  if (!getAccessToken()) return buildSampleModel(range);

  const bounds = rangeBounds(range);
  const options = { signal, fresh };

  const [devicesResult, timelineResult, usageResult, summaryResult, hourlyResult, dailyResult, weeklyResult, monthlyResult, appsResult] =
    await Promise.all([
      attempt(() => fetchDevices(options)),
      attempt(() => fetchTimeline(bounds, options)),
      attempt(() => fetchDeviceUsage(bounds, options)),
      attempt(() => fetchSummary(options)),
      attempt(() => fetchHourlyUsage(bounds, options)),
      attempt(() => fetchDailyUsage(bounds, options)),
      attempt(() => fetchWeeklyUsage(bounds, options)),
      attempt(() => fetchMonthlyUsage(bounds, options)),
      attempt(() => fetchAppUsage(bounds, options)),
    ]);

  const anyLive = [devicesResult, timelineResult, usageResult, summaryResult, hourlyResult, dailyResult, weeklyResult, monthlyResult, appsResult].some(
    (result) => result.ok,
  );
  if (!anyLive) {
    const error = devicesResult.error || timelineResult.error || summaryResult.error;
    throw error || new Error("Could not load your screen time from the API.");
  }

  const listed = devicesResult.ok ? listPayload(devicesResult.data).map(normalizeDevice) : [];
  const usage = usageResult.ok ? listPayload(usageResult.data).map(normalizeDevice) : [];
  const devices = mergeDevices(listed, usage);

  let sessions = [];
  let integration = null;

  if (timelineResult.ok) {
    sessions = filterSessions(sessionsFromTimeline(timelineResult.data, devices), bounds);
  } else {
    const logsResult = await attempt(() => readTimeLogs(bounds, options));
    if (logsResult.ok) {
      sessions = filterSessions(sessionsFromLogs(logsResult.data, devices), bounds);
    } else {
      integration = "Activity will load from /api/dashboard/timeline when that endpoint is available.";
    }
  }

  const hourly = sessions.length
    ? buildHourly(sessions)
    : hourlyResult.ok
      ? hourlyFromAnalytics(hourlyResult.data)
      : buildHourly([]);
  const chartMode = sessions.length ? "split" : "total";
  let stats = buildStats({
    sessions,
    previousSessions: [],
    devices,
  });

  if (summaryResult.ok) {
    stats = applySummaryStats(stats, summaryResult.data, range);
  }

  const daily = dailyResult.ok
    ? dailyFromAnalytics(dailyResult.data)
    : sessions.length
      ? buildDaily(sessions, bounds)
      : [];
  const weekly = weeklyResult.ok ? weeklyFromAnalytics(weeklyResult.data) : [];
  const monthly = monthlyResult.ok ? monthlyFromAnalytics(monthlyResult.data) : [];

  return createModel({
    source: "api",
    range,
    sync: syncStatus(devices),
    stats,
    hourly,
    chartMode,
    sessions,
    apps: appsFromSources(appsResult, sessions),
    devices,
    activity: buildActivity(devices, sessions),
    daily,
    weekly,
    monthly,
    integration,
  });
}

function appsFromSources(appsResult, sessions) {
  const fromSessions = sessions.length ? aggregateApps(sessions) : [];
  if (!appsResult.ok) return fromSessions;
  const fromApi = appsFromApi(appsResult.data);
  if (!fromApi.length) return fromSessions;
  return fromApi.map((app) => {
    const match = fromSessions.find((item) => item.name === app.name);
    return match ? { ...app, devices: match.devices } : app;
  });
}

export function visibleActivity(model, { deviceId = "all", includeSync = true } = {}) {
  return (model?.activity ?? []).filter((item) => {
    if (item.kind === "sync") return includeSync && (deviceId === "all" || item.deviceName === deviceName(model, deviceId));
    if (deviceId === "all") return true;
    return item.deviceName === deviceName(model, deviceId) || item.deviceId === deviceId;
  });
}

function deviceName(model, deviceId) {
  return model.devices.find((device) => device.id === deviceId)?.name;
}
