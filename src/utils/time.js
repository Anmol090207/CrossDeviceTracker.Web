export const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
];

export const REPORT_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
];

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function rangeBounds(range, now = new Date()) {
  const start = startOfDay(now);
  const end = endOfDay(now);

  if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
  } else if (range === "week") {
    start.setDate(start.getDate() - start.getDay());
  } else if (range === "month") {
    start.setDate(1);
  } else if (range === "7d") {
    start.setDate(start.getDate() - 6);
  } else if (range === "30d") {
    start.setDate(start.getDate() - 29);
  } else if (range === "recent") {
    start.setTime(now.getTime() - 24 * 60 * 60 * 1000);
    end.setTime(now.getTime());
  }

  return {
    from: start.toISOString(),
    to: end.toISOString(),
    start,
    end,
  };
}

export function boundsQuery(bounds) {
  const params = new URLSearchParams({
    from: bounds.from,
    to: bounds.to,
  });
  return `?${params.toString()}`;
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  if (minutes) return `${minutes}m`;
  if (seconds) return `${seconds}s`;
  return "0m";
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function formatHour(hour) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const clock = hour % 12 || 12;
  return `${clock} ${suffix}`;
}

export function formatRelative(value, now = Date.now()) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 45) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatDayLabel(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatShortDay(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function inBounds(value, bounds) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= bounds.start.getTime() && time <= bounds.end.getTime();
}

export function deltaHint(current, previous) {
  if (!previous) {
    return {
      text: current ? "No comparison yet" : "No activity yesterday",
      tone: "neutral",
    };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return { text: "Same as yesterday", tone: "neutral" };
  if (percent < 0) {
    return { text: `${Math.abs(percent)}% less than yesterday`, tone: "good" };
  }
  return { text: `${percent}% more than yesterday`, tone: "warn" };
}

export function shareHint(part, total) {
  if (!total) return { text: "No tracked time", tone: "neutral" };
  return { text: `${formatPercent((part / total) * 100)} of total time`, tone: "good" };
}
