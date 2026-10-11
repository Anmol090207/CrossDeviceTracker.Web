import { createModel } from "./metrics";
import { rangeBounds } from "../utils/time";

const APP_COLORS = ["#dbeafe", "#ffe4e6", "#ede9fe"];

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function sampleDevices() {
  return [
    {
      id: "iphone-14",
      name: "iPhone 14",
      platform: "ios",
      formFactor: "mobile",
      online: true,
      lastSyncAt: minutesAgo(4),
      isRevoked: false,
      durationSeconds: 5 * 3600 + 15 * 60,
    },
    {
      id: "macbook-pro",
      name: "MacBook Pro",
      platform: "macos",
      formFactor: "desktop",
      online: true,
      lastSyncAt: minutesAgo(3),
      isRevoked: false,
      durationSeconds: 5 * 3600 + 15 * 60,
    },
    {
      id: "ipad-air",
      name: "iPad Air",
      platform: "ios",
      formFactor: "tablet",
      online: false,
      lastSyncAt: hoursAgo(2),
      isRevoked: false,
      durationSeconds: 0,
    },
  ];
}

function sampleActivity() {
  return [
    {
      id: "sync-mac",
      kind: "sync",
      title: "Online • Last sync completed",
      deviceName: "MacBook Pro",
      formFactor: "desktop",
      at: minutesAgo(3),
      online: true,
    },
    {
      id: "sync-iphone",
      kind: "sync",
      title: "Online • Last sync completed",
      deviceName: "iPhone 14",
      formFactor: "mobile",
      at: minutesAgo(4),
      online: true,
    },
    {
      id: "yt-iphone",
      kind: "session",
      title: "YouTube opened",
      deviceName: "iPhone 14",
      formFactor: "mobile",
      appName: "YouTube",
      durationSeconds: 75 * 60,
      at: hoursAgo(1),
      online: true,
    },
    {
      id: "yt-mac",
      kind: "session",
      title: "YouTube opened",
      deviceName: "MacBook Pro",
      formFactor: "desktop",
      appName: "YouTube",
      durationSeconds: 75 * 60,
      at: hoursAgo(1),
      online: true,
    },
    {
      id: "sync-ipad",
      kind: "sync",
      title: "Offline • Last sync completed",
      deviceName: "iPad Air",
      formFactor: "tablet",
      at: hoursAgo(2),
      online: false,
    },
    {
      id: "chrome-iphone",
      kind: "session",
      title: "Chrome opened",
      deviceName: "iPhone 14",
      formFactor: "mobile",
      appName: "Chrome",
      durationSeconds: 90 * 60,
      at: hoursAgo(3),
      online: true,
    },
    {
      id: "slack-mac",
      kind: "session",
      title: "Slack opened",
      deviceName: "MacBook Pro",
      formFactor: "desktop",
      appName: "Slack",
      durationSeconds: 60 * 60,
      at: hoursAgo(5),
      online: true,
    },
    {
      id: "chrome-mac",
      kind: "session",
      title: "Chrome opened",
      deviceName: "MacBook Pro",
      formFactor: "desktop",
      appName: "Chrome",
      durationSeconds: 2 * 3600,
      at: hoursAgo(8),
      online: true,
    },
  ];
}

function sampleHourly() {
  const points = {
    7: [80, 95],
    8: [100, 110],
    9: [35, 70],
    10: [60, 60],
    11: [85, 175],
    12: [15, 8],
    13: [25, 30],
    14: [90, 180],
    15: [75, 150],
    16: [20, 12],
    17: [10, 5],
  };

  return Object.entries(points).map(([hour, [mobile, desktop]]) => ({
    hour: Number(hour),
    mobileSeconds: mobile * 60,
    desktopSeconds: desktop * 60,
    overlapSeconds: 0,
  }));
}

function sampleDaily(bounds) {
  const pattern = [6.2, 8.1, 7.4, 9.5, 5.2, 3.1, 4.4, 8.8, 10.1, 7.6, 9.2, 6.5, 11.9, 10.5];
  const days = [];
  const cursor = new Date(bounds.start);
  cursor.setHours(0, 0, 0, 0);
  let index = 0;
  while (cursor <= bounds.end && days.length < 62) {
    const hours = pattern[(pattern.length - 1 - index) % pattern.length];
    days.push({
      date: cursor.toISOString(),
      label: cursor.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      seconds: Math.round(hours * 3600),
    });
    cursor.setDate(cursor.getDate() + 1);
    index += 1;
  }
  if (days.length) days[days.length - 1].seconds = 10.5 * 3600;
  return days;
}

function statsFor(range) {
  const presets = {
    today: ["10h 30m", "12% less than yesterday", "5h 15m", "5h 15m", "0m"],
    recent: ["10h 30m", "12% less than yesterday", "5h 15m", "5h 15m", "0m"],
    yesterday: ["11h 56m", "Previous day", "6h 10m", "5h 46m", "18m"],
    week: ["42h 15m", "Since Sunday", "22h 40m", "19h 35m", "1h 12m"],
    month: ["168h", "This month", "86h 20m", "81h 40m", "4h 05m"],
    "7d": ["48h 10m", "Last 7 days", "25h 05m", "23h 05m", "1h 40m"],
    "30d": ["168h", "Last 30 days", "86h 20m", "81h 40m", "4h 05m"],
  };
  const [total, hint, mobile, desktop, overlap] = presets[range] || presets.today;
  return [
    { id: "total", label: "Total Screen Time", value: total, hint, tone: hint.includes("more") ? "warn" : "good", icon: "clock" },
    { id: "mobile", label: "Mobile Usage", value: mobile, hint: "50% of total time", tone: "good", icon: "phone" },
    { id: "desktop", label: "Desktop Usage", value: desktop, hint: "50% of total time", tone: "good", icon: "laptop" },
    { id: "overlap", label: "Overlap Time", value: overlap, hint: "Detected & adjusted", tone: "good", icon: "layers" },
  ];
}

function sampleSessions() {
  return [
    session("chrome-1", "Chrome", "iphone-14", "iPhone 14", "mobile", 5 * 3600, 3),
    session("youtube-1", "YouTube", "iphone-14", "iPhone 14", "mobile", 4 * 3600, 1),
    session("youtube-2", "YouTube", "macbook-pro", "MacBook Pro", "desktop", 75 * 60, 1),
    session("slack-1", "Slack", "macbook-pro", "MacBook Pro", "desktop", 3600, 5),
    session("chrome-2", "Chrome", "macbook-pro", "MacBook Pro", "desktop", 2 * 3600, 8),
  ];
}

function session(id, appName, deviceId, deviceName, formFactor, durationSeconds, hours) {
  const end = new Date(Date.now() - hours * 3600 * 1000);
  const start = new Date(end.getTime() - durationSeconds * 1000);
  return {
    id,
    appName,
    deviceId,
    deviceName,
    formFactor,
    platform: formFactor === "desktop" ? "macos" : "ios",
    start: start.toISOString(),
    end: end.toISOString(),
    durationSeconds,
  };
}

export function buildSampleModel(range = "today") {
  const bounds = rangeBounds(range);
  const activity = sampleActivity().filter(
    (item) => item.kind === "sync" || new Date(item.at) >= bounds.start,
  );

  return createModel({
    source: "sample",
    range,
    sync: { state: "partial", label: "Partial Sync" },
    stats: statsFor(range),
    hourly: sampleHourly(),
    chartMode: "split",
    sessions: sampleSessions(),
    apps: SAMPLE_APPS,
    devices: sampleDevices(),
    activity: activity.length ? activity : sampleActivity(),
    daily: sampleDaily(bounds),
    weekly: samplePeriods(4, 7, [28, 36, 41, 42]),
    monthly: samplePeriods(4, 30, [120, 148, 160, 168]),
    integration: null,
  });
}

function samplePeriods(count, dayStep, hours) {
  return hours.slice(-count).map((value, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index) * dayStep);
    return {
      date: date.toISOString(),
      label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      seconds: value * 3600,
      sessionCount: 0,
    };
  });
}

export const SAMPLE_APPS = [
  {
    name: "Chrome",
    seconds: 5 * 3600,
    percentage: 48,
    devices: ["iPhone 14", "MacBook Pro"],
    color: APP_COLORS[0],
  },
  {
    name: "YouTube",
    seconds: 4 * 3600,
    percentage: 38,
    devices: ["iPhone 14", "MacBook Pro"],
    color: APP_COLORS[1],
  },
  {
    name: "Slack",
    seconds: 3600,
    percentage: 10,
    devices: ["iPhone 14", "MacBook Pro"],
    color: APP_COLORS[2],
  },
];

