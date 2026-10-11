import { Buffer } from "node:buffer";

const users = new Map();
const linkTokens = new Map();
const extraDevices = [];
const extraLogs = [];

const IPHONE = "11111111-1111-4111-8111-111111111111";
const MACBOOK = "22222222-2222-4222-8222-222222222222";
const IPAD = "33333333-3333-4333-8333-333333333333";

function isoMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function session(deviceId, deviceName, platform, app, minutesAgo, durationMinutes) {
  const end = new Date(Date.now() - minutesAgo * 60 * 1000);
  const start = new Date(end.getTime() - durationMinutes * 60 * 1000);
  return {
    id: `${deviceId}-${app}-${minutesAgo}`,
    deviceId,
    device: deviceName,
    platform,
    app,
    appName: app,
    packageName: app.toLowerCase(),
    start: start.toISOString(),
    end: end.toISOString(),
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationSeconds: durationMinutes * 60,
    createdAt: end.toISOString(),
  };
}

function seedLogs() {
  return [
    session(IPHONE, "iPhone 14", "ios", "YouTube", 60, 75),
    session(MACBOOK, "MacBook Pro", "macos", "YouTube", 60, 75),
    session(IPHONE, "iPhone 14", "ios", "Chrome", 180, 90),
    session(MACBOOK, "MacBook Pro", "macos", "Slack", 300, 60),
    session(MACBOOK, "MacBook Pro", "macos", "Chrome", 480, 120),
    ...extraLogs,
  ];
}

function seedDevices() {
  return [
    {
      id: IPHONE,
      deviceName: "iPhone 14",
      platform: "ios",
      installationId: "iphone-14",
      isRevoked: false,
      lastDataSyncAt: isoMinutesAgo(4),
      createdAt: isoMinutesAgo(60 * 24 * 12),
    },
    {
      id: MACBOOK,
      deviceName: "MacBook Pro",
      platform: "macos",
      installationId: "macbook-pro",
      isRevoked: false,
      lastDataSyncAt: isoMinutesAgo(3),
      createdAt: isoMinutesAgo(60 * 24 * 40),
    },
    {
      id: IPAD,
      deviceName: "iPad Air",
      platform: "ios",
      installationId: "ipad-air",
      isRevoked: false,
      lastDataSyncAt: isoMinutesAgo(120),
      createdAt: isoMinutesAgo(60 * 24 * 20),
    },
    ...extraDevices,
  ];
}

function summary() {
  return {
    today: {
      totalScreenTimeSeconds: 10 * 3600 + 30 * 60,
      totalDeviceUsageSeconds: 10 * 3600 + 30 * 60,
      overlapTimeSeconds: 0,
      sessionCount: 5,
    },
    yesterday: { totalScreenTimeSeconds: 11 * 3600 + 56 * 60, sessionCount: 6 },
    thisWeek: { totalScreenTimeSeconds: 42 * 3600 + 15 * 60, sessionCount: 28 },
    thisMonth: { totalScreenTimeSeconds: 168 * 3600, sessionCount: 90 },
    deviceCount: seedDevices().length,
    appCount: 3,
    mostUsedApp: { appName: "Chrome", durationSeconds: 5 * 3600 },
  };
}

function apps() {
  return [
    { appName: "Chrome", durationSeconds: 5 * 3600, percentage: 48, sessionCount: 2 },
    { appName: "YouTube", durationSeconds: 4 * 3600, percentage: 38, sessionCount: 2 },
    { appName: "Slack", durationSeconds: 3600, percentage: 10, sessionCount: 1 },
  ];
}

function deviceUsage() {
  return {
    activeCount: 2,
    devices: [
      {
        deviceId: IPHONE,
        deviceName: "iPhone 14",
        platform: "ios",
        isActive: true,
        lastSyncAt: isoMinutesAgo(4),
        durationSeconds: 5 * 3600 + 15 * 60,
        percentage: 50,
        sessionCount: 2,
      },
      {
        deviceId: MACBOOK,
        deviceName: "MacBook Pro",
        platform: "macos",
        isActive: true,
        lastSyncAt: isoMinutesAgo(3),
        durationSeconds: 5 * 3600 + 15 * 60,
        percentage: 50,
        sessionCount: 3,
      },
      {
        deviceId: IPAD,
        deviceName: "iPad Air",
        platform: "ios",
        isActive: false,
        lastSyncAt: isoMinutesAgo(120),
        durationSeconds: 0,
        percentage: 0,
        sessionCount: 0,
      },
    ],
  };
}

function hourly() {
  const points = { 7: 80, 8: 110, 9: 70, 10: 60, 11: 175, 12: 15, 14: 180, 15: 150, 16: 20 };
  return {
    hours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      durationSeconds: (points[hour] || 0) * 60,
      sessionCount: points[hour] ? 1 : 0,
    })),
  };
}

function daily() {
  return {
    days: [6.2, 8.1, 7.4, 9.5, 5.2, 4.4, 10.5].map((hours, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return { date: date.toISOString(), durationSeconds: Math.round(hours * 3600), sessionCount: 4 };
    }),
  };
}

function weekly() {
  return {
    weeks: [28, 36, 41, 42].map((hours, index) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay() - (3 - index) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        durationSeconds: hours * 3600,
        sessionCount: 20,
      };
    }),
  };
}

function monthly() {
  return {
    months: [120, 148, 160, 168].map((hours, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (3 - index));
      return { year: date.getFullYear(), month: date.getMonth() + 1, durationSeconds: hours * 3600, sessionCount: 80 };
    }),
  };
}

function tokenFrom(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  return header.replace(/^Bearer\s+/i, "");
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (!chunks.length) {
        resolve(null);
        return;
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      try {
        resolve(raw ? JSON.parse(raw) : null);
      } catch {
        resolve(raw);
      }
    });
  });
}

function handle(req, path, body) {
  const token = tokenFrom(req);
  const authed = Boolean(token);

  if (req.method === "POST" && path === "/api/auth/register") {
    const email = body?.email || "";
    const password = body?.password || "";
    if (!email || !password) return [400, "Email and password are required"];
    users.set(email, password);
    return [201, { userId: "test-user", email }];
  }

  if (req.method === "POST" && path === "/api/auth/token") {
    const email = body?.email || "";
    const password = body?.password || "";
    if (!email || !password) return [400, "Email and password are required"];
    const known = users.get(email);
    if (known && known !== password) return [401, "Invalid Email or password"];
    users.set(email, password);
    return [200, { accessToken: `test-user.${Buffer.from(email).toString("base64url")}`, email }];
  }

  if (!authed && path !== "/api/devices/link") return [401, "Unauthorized"];

  if (req.method === "GET" && path === "/api/devices") return [200, seedDevices()];
  if (req.method === "GET" && path === "/api/dashboard/summary") return [200, summary()];
  if (req.method === "GET" && path === "/api/dashboard/apps") return [200, apps()];
  if (req.method === "GET" && path === "/api/dashboard/devices") return [200, deviceUsage()];
  if (req.method === "GET" && path === "/api/dashboard/timeline") {
    return [200, { entries: seedLogs() }];
  }
  if (req.method === "GET" && path === "/api/analytics/hourly") return [200, hourly()];
  if (req.method === "GET" && path === "/api/analytics/daily") return [200, daily()];
  if (req.method === "GET" && path === "/api/analytics/weekly") return [200, weekly()];
  if (req.method === "GET" && path === "/api/analytics/monthly") return [200, monthly()];
  if (req.method === "GET" && path === "/api/timelogs") {
    return [200, { items: seedLogs(), nextCursor: null, hasMore: false }];
  }

  if (req.method === "POST" && path === "/api/devices") {
    const id = crypto.randomUUID();
    extraDevices.push({
      id,
      deviceName: body?.deviceName || "New device",
      platform: body?.platform || "web",
      installationId: body?.installationId || id,
      isRevoked: false,
      lastDataSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return [201, { deviceId: id, deviceJwt: `test-device.${id}` }];
  }

  if (req.method === "POST" && path === "/api/devices/link-token") {
    const token = `test-link-${crypto.randomUUID().replaceAll("-", "")}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    linkTokens.set(token, expiresAt);
    return [200, { token, expiresAt }];
  }

  if (req.method === "POST" && path === "/api/devices/link") {
    const linkToken = body?.linkToken || "";
    if (linkToken.length < 20) {
      return [400, { errors: { LinkToken: ["The field LinkToken must be a string or array type with a minimum length of '20'."] } }];
    }
    if (!linkTokens.has(linkToken)) return [400, "Invalid or expired link token"];
    linkTokens.delete(linkToken);
    return [200, { deviceId: crypto.randomUUID(), deviceName: body?.deviceName || "Linked device" }];
  }

  if (req.method === "POST" && (path === "/api/timelogs" || path === "/api/timelogs/batch")) {
    if (!token.startsWith("test-device.")) return [401, { error: "DeviceId claim is missing." }];
    const entries = Array.isArray(body) ? body : [body];
    extraLogs.push(...entries.filter(Boolean));
    return [200, entries];
  }

  return [404, `No test route for ${req.method} ${path}`];
}

export function mockApiPlugin() {
  return {
    name: "crosstime-test-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        if (!path?.startsWith("/api/")) {
          next();
          return;
        }
        const body = await readBody(req);
        const [status, payload] = handle(req, path, body);
        json(res, status, payload);
      });
    },
  };
}
