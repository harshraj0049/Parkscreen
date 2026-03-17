const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// All fetch calls use credentials: 'include'
// This tells the browser to send the HttpOnly cookie automatically
// No token handling needed on the frontend at all

// ── AUTH ──────────────────────────────────────────

export async function registerUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',            // ← add this to every request
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',            // ← cookie gets set here by backend
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
  // no token to store — cookie is set automatically by the browser
}

export async function getCurrentUser() {  // ← no token parameter needed
  const res = await fetch(`${BASE_URL}/auth/me`, {
    credentials: 'include',            // ← cookie is sent automatically
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Not authenticated');
  return data;
}

export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',            // ← backend clears the cookie
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Logout failed');
  return data;
}

// ── TYPING SESSION ────────────────────────────────

export async function submitTypingSession(events, token) {
  const res = await fetch(`${BASE_URL}/session/predict`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ events }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Prediction failed');
  return data; // { session_id, probability, prediction, message }
}

// ── HISTORY ───────────────────────────────────────

export async function getSessionHistory(token) {
  const res = await fetch(`${BASE_URL}/sessions/history`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch history');
  return data; // { sessions: [...] }
}

export async function getSessionDetail(sessionId, token) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch session');
  return data;
}

// ── FEEDBACK ──────────────────────────────────────

export async function submitFeedback(payload, token) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Feedback submission failed');
  return data;
}