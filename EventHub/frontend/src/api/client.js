const API_BASE = process.env.REACT_APP_API_URL || "/api";
const TOKEN_KEY = "eventhub_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request("/health"),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),
  getEvents: () => request("/events"),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) => request("/events", { method: "POST", body: JSON.stringify(body) }),
  registerFree: (eventId) => request(`/events/${eventId}/register-free`, { method: "POST", body: "{}" }),
  getTransactions: () => request("/events/transactions/list"),
  getPaymentConfig: () => request("/payments/config"),
  getPaymentSettings: () => request("/payments/settings"),
  savePaymentSettings: (body) =>
    request("/payments/settings", { method: "PUT", body: JSON.stringify(body) }),
  createPaymentOrder: (body) =>
    request("/payments/create-order", { method: "POST", body: JSON.stringify(body) }),
  verifyPayment: (body) =>
    request("/payments/verify", { method: "POST", body: JSON.stringify(body) })
};

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
