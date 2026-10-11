const TOKEN_KEY = "accessToken";
const EMAIL_KEY = "email";

export function readSession() {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  if (!accessToken) return null;
  return {
    accessToken,
    email: localStorage.getItem(EMAIL_KEY) || "",
  };
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function writeSession(session) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  if (session.email) localStorage.setItem(EMAIL_KEY, session.email);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
