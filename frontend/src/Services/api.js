const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper: reads the stored token and builds the Authorization header
function authHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ── AUTH ──────────────────────────────────────────

export async function registerUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  // store the token returned by the backend
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { ...authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Not authenticated');
  return data;
}

export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { ...authHeader() },
  });
  localStorage.removeItem('access_token');
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Logout failed');
  return data;
}

// ── TYPING SESSION ────────────────────────────────

export async function submitTypingSession(events) {
  const res = await fetch(`${BASE_URL}/session/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify({ events }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Prediction failed');
  return data;
}

// ── HISTORY ───────────────────────────────────────

export async function getSessionHistory() {
  const res = await fetch(`${BASE_URL}/sessions/history`, {
    headers: { ...authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch history');
  return data;
}

export async function getSessionDetail(sessionId) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    headers: { ...authHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch session');
  return data;
}

// ── FEEDBACK ──────────────────────────────────────

export async function submitFeedback(payload) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Feedback submission failed');
  return data;
}