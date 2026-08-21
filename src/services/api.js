const BASE_URL =
  "https://crossdevicetracker-api-hy-erhyaffahwaufsba.southeastasia-01.azurewebsites.net";

export const signUp = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }

  return await response.json();
};

export const signIn = async (email, password) => {
  const response = await fetch(`${BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }

  return await response.json();
};

export async function generateLinkToken() {
  const token = localStorage.getItem("accessToken");

  console.log("Token:", token);
  console.log("All localStorage:", localStorage);

  const response = await fetch(`${BASE_URL}/api/devices/link-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to generate token");
  }

  return response.json();
}

export async function getDevices() {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${BASE_URL}/api/devices`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch devices");
  }

  return await response.json();
}
