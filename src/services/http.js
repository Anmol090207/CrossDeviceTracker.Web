import { getAccessToken } from "./session";

const DEPLOYED_API =
  "https://crossdevicetracker-api-hy-erhyaffahwaufsba.southeastasia-01.azurewebsites.net";

// In dev, calls stay on this origin and Vite proxies /api, which avoids CORS.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "" : DEPLOYED_API);

const CACHE_MS = 10_000;
const cache = new Map();

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function clearApiCache() {
  cache.clear();
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function messageFromBody(body, status) {
  if (typeof body === "string") {
    const text = body.trim();
    if (!text || text.startsWith("<") || text.length > 280) {
      return `Request failed (${status}).`;
    }
    return text;
  }

  if (body?.errors && typeof body.errors === "object") {
    const first = Object.values(body.errors).flat()[0];
    if (first) return String(first);
  }

  return (
    body?.message ||
    body?.Message ||
    body?.errorMessage ||
    body?.ErrorMessage ||
    body?.title ||
    body?.Title ||
    `Request failed (${status}).`
  );
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request(path, { method = "GET", body, auth = true, signal, fresh = false } = {}) {
  const cacheKey = method === "GET" ? path : null;
  if (cacheKey && !fresh) {
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Could not reach the CrossTime API. Check your connection and try again.");
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized();
    throw new ApiError(messageFromBody(payload, response.status), response.status);
  }

  if (cacheKey) cache.set(cacheKey, { at: Date.now(), data: payload });
  return payload;
}
