import { getStoredAuth, saveAuthData, clearStoredAuth } from "./authStorage";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function authFetch(endpoint, options = {}) {
  let { token, refreshToken } = getStoredAuth() || {};
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, refreshToken }),
    });

    if (!refreshRes.ok) {
      clearStoredAuth();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    const data = await refreshRes.json();
    saveAuthData(data);
    token = data.token;

    res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  // ✅ gracefully handle no-content
  const contentType = res.headers.get("content-type");
  if (res.status === 204 || !contentType?.includes("application/json")) {
    return null;
  }

  return res.json();
}
