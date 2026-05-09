const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// No authHeaders needed anymore — cookie is sent automatically by browser
// The only thing every request needs is: credentials: 'include'

// ── AUTH ──────────────────────────────────────────

export async function registerUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
    localStorage.setItem('access_token', data.access_token);
    return data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Not authenticated');
    return data;
}

export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Logout failed');
  return data;
}

// ── TYPING SESSION ────────────────────────────────

export async function submitTypingSession(events) {  // ← token param removed
  const res = await fetch(`${BASE_URL}/session/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',                           // ← cookie sent automatically
    body: JSON.stringify({ events }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Prediction failed');
  return data;
}

// ── HISTORY ───────────────────────────────────────

export async function getSessionHistory() {           // ← token param removed
  const res = await fetch(`${BASE_URL}/sessions/history`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch history');
  return data;
}

export async function getSessionDetail(sessionId) {   // ← token param removed
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch session');
  return data;
}

// ── FEEDBACK ──────────────────────────────────────

export async function submitFeedback(payload) {       // ← token param removed
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Feedback submission failed');
  return data;
}