import { pick } from "../utils/object";
import { classifyFormFactor, isDeviceOnline, usageFamily } from "../utils/platform";
import {
  deltaHint,
  formatDuration,
  formatShortDay,
  inBounds,
  shareHint,
} from "../utils/time";

const APP_COLORS = ["#dbeafe", "#ffe4e6", "#ede9fe", "#dcfce7", "#ffedd5", "#e0f2fe", "#fce7f3"];

export function createModel(partial = {}) {
  return {
    source: "api",
    range: "today",
    sync: { state: "empty", label: "No devices" },
    stats: [],
    hourly: emptyHours(),
    chartMode: "split",
    sessions: [],
    apps: [],
    devices: [],
    activity: [],
    daily: [],
    weekly: [],
    monthly: [],
    integration: null,
    ...partial,
  };
}

export function emptyHours() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    mobileSeconds: 0,
    desktopSeconds: 0,
    overlapSeconds: 0,
  }));
}

export function normalizeDevice(raw) {
  const id = String(pick(raw, "id", "Id", "deviceId", "DeviceId") ?? "");
  const name = pick(raw, "deviceName", "DeviceName", "name", "Name") || "Unknown device";
  const platform = pick(raw, "platform", "Platform") || "unknown";
  const lastSyncAt = pick(raw, "lastDataSyncAt", "LastDataSyncAt", "lastSyncAt", "LastSyncAt") || null;
  const isRevoked = Boolean(pick(raw, "isRevoked", "IsRevoked"));
  const activeFlag = pick(raw, "isActive", "IsActive");
  const online = typeof activeFlag === "boolean" ? activeFlag : isDeviceOnline(lastSyncAt, isRevoked);

  return {
    id,
    name,
    platform,
    formFactor: classifyFormFactor(platform, name),
    lastSyncAt,
    isRevoked,
    online,
    durationSeconds: Number(pick(raw, "durationSeconds", "DurationSeconds") || 0),
  };
}

export function mergeDevices(listed = [], usage = []) {
  const byId = new Map();
  for (const device of listed) {
    if (device.id) byId.set(device.id, device);
  }
  for (const device of usage) {
    if (!device.id) continue;
    const existing = byId.get(device.id);
    byId.set(
      device.id,
      existing
        ? {
            ...existing,
            ...device,
            lastSyncAt: device.lastSyncAt || existing.lastSyncAt,
            durationSeconds: device.durationSeconds || existing.durationSeconds,
          }
        : device,
    );
  }
  return [...byId.values()].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return new Date(b.lastSyncAt || 0) - new Date(a.lastSyncAt || 0);
  });
}

export function normalizeTimelineEntry(raw, devicesById) {
  const deviceName = pick(raw, "device", "Device", "deviceName", "DeviceName") || "Unknown device";
  const platform = pick(raw, "platform", "Platform") || devicesById.get(deviceName)?.platform || "";
  const deviceId = String(pick(raw, "deviceId", "DeviceId") || deviceName);
  const known = devicesById.get(deviceId) || devicesById.get(deviceName);
  const start = pick(raw, "start", "Start", "startTime", "StartTime");
  const end = pick(raw, "end", "End", "endTime", "EndTime");
  const durationSeconds = Number(
    pick(raw, "durationSeconds", "DurationSeconds") ||
      Math.max(0, (new Date(end) - new Date(start)) / 1000),
  );

  return {
    id: String(pick(raw, "id", "Id") || `${deviceId}-${start}-${pick(raw, "app", "App", "appName", "AppName")}`),
    appName: pick(raw, "app", "App", "appName", "AppName") || "Unknown app",
    deviceId: known?.id || deviceId,
    deviceName: known?.name || deviceName,
    platform: known?.platform || platform,
    formFactor: known?.formFactor || classifyFormFactor(platform, deviceName),
    start,
    end,
    durationSeconds,
  };
}

export function normalizeTimeLog(raw, devicesById) {
  const deviceId = String(pick(raw, "deviceId", "DeviceId") || "");
  const known = devicesById.get(deviceId);
  return normalizeTimelineEntry(
    {
      ...raw,
      app: pick(raw, "appName", "AppName"),
      device: known?.name,
      platform: known?.platform,
      start: pick(raw, "startTime", "StartTime"),
      end: pick(raw, "endTime", "EndTime"),
    },
    devicesById,
  );
}

function deviceIndex(devices) {
  const byId = new Map();
  for (const device of devices) {
    byId.set(device.id, device);
    byId.set(device.name, device);
  }
  return byId;
}

export function sessionsFromTimeline(payload, devices) {
  const entries = Array.isArray(payload)
    ? payload
    : payload?.entries || payload?.Entries || [];
  const byId = deviceIndex(devices);
  return entries
    .map((entry) => normalizeTimelineEntry(entry, byId))
    .filter((session) => session.start);
}

export function sessionsFromLogs(logs, devices) {
  const byId = deviceIndex(devices);
  return logs.map((log) => normalizeTimeLog(log, byId)).filter((session) => session.start);
}

export function filterSessions(sessions, bounds) {
  return sessions.filter((session) => inBounds(session.start, bounds));
}

function mergeIntervals(intervals) {
  const sorted = intervals
    .map((interval) => ({ start: interval.start, end: interval.end }))
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);
  const merged = [];
  for (const interval of sorted) {
    const last = merged.at(-1);
    if (!last || interval.start > last.end) merged.push({ ...interval });
    else last.end = Math.max(last.end, interval.end);
  }
  return merged;
}

function sessionIntervals(sessions) {
  return sessions
    .map((session) => ({
      start: new Date(session.start).getTime(),
      end: new Date(session.end || session.start).getTime(),
      family: usageFamily(session.formFactor),
    }))
    .filter((interval) => !Number.isNaN(interval.start) && interval.end > interval.start);
}

export function attentionSeconds(sessions) {
  const merged = mergeIntervals(sessionIntervals(sessions));
  return merged.reduce((sum, interval) => sum + (interval.end - interval.start) / 1000, 0);
}

export function rawSeconds(sessions) {
  return sessions.reduce((sum, session) => sum + (Number(session.durationSeconds) || 0), 0);
}

export function familyTotals(sessions) {
  return sessions.reduce(
    (totals, session) => {
      const family = usageFamily(session.formFactor);
      totals[family] += Number(session.durationSeconds) || 0;
      return totals;
    },
    { mobile: 0, desktop: 0 },
  );
}

function addDuration(hours, start, end, key) {
  let cursor = start;
  while (cursor < end) {
    const date = new Date(cursor);
    const hourEnd = new Date(date);
    hourEnd.setMinutes(0, 0, 0);
    hourEnd.setHours(date.getHours() + 1);
    const sliceEnd = Math.min(end, hourEnd.getTime());
    hours[date.getHours()][key] += (sliceEnd - cursor) / 1000;
    cursor = sliceEnd;
  }
}

export function buildHourly(sessions) {
  const hours = emptyHours();
  const intervals = sessionIntervals(sessions);

  for (const interval of intervals) {
    const key = interval.family === "desktop" ? "desktopSeconds" : "mobileSeconds";
    addDuration(hours, interval.start, interval.end, key);
  }

  const mobile = mergeIntervals(intervals.filter((interval) => interval.family !== "desktop"));
  const desktop = mergeIntervals(intervals.filter((interval) => interval.family === "desktop"));
  for (const left of mobile) {
    for (const right of desktop) {
      const from = Math.max(left.start, right.start);
      const to = Math.min(left.end, right.end);
      if (to > from) addDuration(hours, from, to, "overlapSeconds");
    }
  }

  return hours;
}

export function hourlyFromAnalytics(payload) {
  const hours = emptyHours();
  const entries = Array.isArray(payload) ? payload : payload?.hours || payload?.Hours || [];
  for (const entry of entries) {
    const hour = Number(pick(entry, "hour", "Hour"));
    if (hour < 0 || hour > 23) continue;
    hours[hour].mobileSeconds = Number(pick(entry, "durationSeconds", "DurationSeconds") || 0);
  }
  return hours;
}

export function buildDaily(sessions, bounds) {
  const days = [];
  const cursor = new Date(bounds.start);
  cursor.setHours(0, 0, 0, 0);
  const end = bounds.end.getTime();

  while (cursor.getTime() <= end && days.length < 62) {
    const dayStart = cursor.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const daySessions = sessions.filter((session) => {
      const start = new Date(session.start).getTime();
      return start >= dayStart && start < dayEnd;
    });
    days.push({
      date: new Date(cursor).toISOString(),
      label: formatShortDay(cursor),
      seconds: attentionSeconds(daySessions),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function dailyFromAnalytics(payload) {
  return seriesFromAnalytics(payload, ["days", "Days"], (entry) => {
    const date = pick(entry, "date", "Date");
    return {
      date,
      label: date ? formatShortDay(date) : "Day",
    };
  });
}

export function weeklyFromAnalytics(payload) {
  return seriesFromAnalytics(payload, ["weeks", "Weeks"], (entry) => {
    const start = pick(entry, "weekStart", "WeekStart", "date", "Date");
    return {
      date: start,
      label: start ? formatShortDay(start) : "Week",
    };
  });
}

export function monthlyFromAnalytics(payload) {
  return seriesFromAnalytics(payload, ["months", "Months"], (entry) => {
    const year = Number(pick(entry, "year", "Year"));
    const month = Number(pick(entry, "month", "Month"));
    const date = year && month ? new Date(year, month - 1, 1).toISOString() : pick(entry, "date", "Date");
    const label =
      year && month
        ? new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
        : date
          ? formatShortDay(date)
          : "Month";
    return { date, label };
  });
}

function seriesFromAnalytics(payload, keys, identify) {
  const entries = Array.isArray(payload) ? payload : payload?.[keys[0]] || payload?.[keys[1]] || [];
  return entries.map((entry) => ({
    ...identify(entry),
    seconds: Number(pick(entry, "durationSeconds", "DurationSeconds") || 0),
    sessionCount: Number(pick(entry, "sessionCount", "SessionCount") || 0),
  }));
}

export function aggregateApps(sessions, deviceId = "all") {
  const filtered =
    deviceId === "all" ? sessions : sessions.filter((session) => session.deviceId === deviceId);
  const total = rawSeconds(filtered);
  const grouped = new Map();

  for (const session of filtered) {
    const name = session.appName || "Unknown app";
    const current = grouped.get(name) || { name, seconds: 0, devices: new Set() };
    current.seconds += Number(session.durationSeconds) || 0;
    if (session.deviceName) current.devices.add(session.deviceName);
    grouped.set(name, current);
  }

  return [...grouped.values()]
    .map((entry, index) => ({
      name: entry.name,
      seconds: entry.seconds,
      percentage: total ? (entry.seconds / total) * 100 : 0,
      devices: [...entry.devices],
      color: APP_COLORS[index % APP_COLORS.length],
    }))
    .sort((a, b) => b.seconds - a.seconds);
}

export function appsFromApi(payload) {
  const entries = Array.isArray(payload) ? payload : payload?.apps || payload?.Apps || [];
  const total = entries.reduce(
    (sum, entry) => sum + Number(pick(entry, "durationSeconds", "DurationSeconds") || 0),
    0,
  );
  return entries
    .map((entry, index) => {
      const seconds = Number(pick(entry, "durationSeconds", "DurationSeconds") || 0);
      const percentage = pick(entry, "percentage", "Percentage");
      return {
        name: pick(entry, "appName", "AppName") || "Unknown app",
        seconds,
        percentage: percentage == null ? (total ? (seconds / total) * 100 : 0) : Number(percentage),
        devices: [],
        color: APP_COLORS[index % APP_COLORS.length],
      };
    })
    .sort((a, b) => b.seconds - a.seconds);
}

export function buildActivity(devices, sessions) {
  const syncEvents = devices
    .filter((device) => device.lastSyncAt)
    .map((device) => ({
      id: `sync-${device.id}`,
      kind: "sync",
      title: `${device.online ? "Online" : "Offline"} • Last sync completed`,
      deviceName: device.name,
      formFactor: device.formFactor,
      at: device.lastSyncAt,
      online: device.online,
    }));

  const sessionEvents = sessions.map((session) => ({
    id: session.id,
    kind: "session",
    title: `${session.appName} opened`,
    deviceName: session.deviceName,
    formFactor: session.formFactor,
    appName: session.appName,
    durationSeconds: session.durationSeconds,
    at: session.end || session.start,
    online: true,
  }));

  return [...syncEvents, ...sessionEvents].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export function syncStatus(devices) {
  if (!devices.length) return { state: "empty", label: "No devices" };
  const online = devices.filter((device) => device.online).length;
  if (online === devices.length) return { state: "synced", label: "Synced" };
  if (online === 0) return { state: "stale", label: "Sync stalled" };
  return { state: "partial", label: "Partial Sync" };
}

export function buildStats({ sessions, previousSessions, devices }) {
  const total = attentionSeconds(sessions);
  const previous = attentionSeconds(previousSessions);
  const raw = rawSeconds(sessions);
  const families = familyTotals(sessions);
  const deviceDuration = devices.reduce((sum, device) => sum + (device.durationSeconds || 0), 0);
  const mobile = families.mobile || (deviceDuration ? sumFamily(devices, "mobile") : 0);
  const desktop = families.desktop || (deviceDuration ? sumFamily(devices, "desktop") : 0);
  const tracked = mobile + desktop || raw;
  const overlap = Math.max(0, raw - total);
  const comparison = deltaHint(total, previous);

  return [
    {
      id: "total",
      label: "Total Screen Time",
      value: formatDuration(total),
      hint: comparison.text,
      tone: comparison.tone,
      icon: "clock",
    },
    {
      id: "mobile",
      label: "Mobile Usage",
      value: formatDuration(mobile),
      hint: shareHint(mobile, tracked).text,
      tone: "good",
      icon: "phone",
    },
    {
      id: "desktop",
      label: "Desktop Usage",
      value: formatDuration(desktop),
      hint: shareHint(desktop, tracked).text,
      tone: "good",
      icon: "laptop",
    },
    {
      id: "overlap",
      label: "Overlap Time",
      value: formatDuration(overlap),
      hint: "Detected & adjusted",
      tone: "good",
      icon: "layers",
    },
  ];
}

function sumFamily(devices, family) {
  return devices
    .filter((device) => usageFamily(device.formFactor) === family)
    .reduce((sum, device) => sum + (device.durationSeconds || 0), 0);
}

export function summarySeconds(summary, range) {
  if (!summary) return null;
  const period = {
    today: pick(summary, "today", "Today"),
    yesterday: pick(summary, "yesterday", "Yesterday"),
    week: pick(summary, "thisWeek", "ThisWeek"),
    month: pick(summary, "thisMonth", "ThisMonth"),
  }[range];
  if (!period) return null;
  return {
    total: Number(pick(period, "totalScreenTimeSeconds", "TotalScreenTimeSeconds") || 0),
    raw: Number(pick(period, "totalDeviceUsageSeconds", "TotalDeviceUsageSeconds") || 0),
    overlap: Number(pick(period, "overlapTimeSeconds", "OverlapTimeSeconds") || 0),
    yesterday: Number(
      pick(pick(summary, "yesterday", "Yesterday"), "totalScreenTimeSeconds", "TotalScreenTimeSeconds") || 0,
    ),
  };
}

export function applySummaryStats(stats, summary, range) {
  const numbers = summarySeconds(summary, range);
  if (!numbers) return stats;
  const comparison =
    range === "today" ? deltaHint(numbers.total, numbers.yesterday) : { text: stats[0]?.hint, tone: stats[0]?.tone };
  return stats.map((stat) => {
    if (stat.id === "total") {
      return {
        ...stat,
        value: formatDuration(numbers.total),
        hint: comparison.text || stat.hint,
        tone: comparison.tone || stat.tone,
      };
    }
    if (stat.id === "overlap" && numbers.overlap >= 0 && numbers.raw) {
      return { ...stat, value: formatDuration(numbers.overlap) };
    }
    return stat;
  });
}
