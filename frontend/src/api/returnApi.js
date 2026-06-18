import { refreshToken } from './authApi';

const BASE_URL = '/api/returns';

function getStoredAuth() {
  try {
    const data = localStorage.getItem('auth');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function getValidToken() {
  const auth = getStoredAuth();
  if (!auth) return null;

  try {
    const payload = JSON.parse(atob(auth.accessToken.split('.')[1]));
    const now = Date.now() / 1000;

    if (payload.exp > now + 30) return auth.accessToken;

    const result = await refreshToken(auth.refreshToken);
    const updated = { ...auth, accessToken: result.accessToken, refreshToken: result.refreshToken };
    localStorage.setItem('auth', JSON.stringify(updated));
    return result.accessToken;
  } catch {
    localStorage.removeItem('auth');
    window.location.href = '/login';
    return null;
  }
}

async function parseError(res) {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    return body.error || (body.fieldErrors ? JSON.stringify(body.fieldErrors) : 'Request failed');
  } catch {
    return text || `Error ${res.status}`;
  }
}

async function apiFetch(path, options = {}) {
  const token = await getValidToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('auth');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) throw new Error(await parseError(res));

  return res.json();
}

export async function submitReturn(data) {
  return apiFetch('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getReturns() {
  return apiFetch('');
}

export async function getMyReturns() {
  return apiFetch('/mine');
}

export async function reviewReturn(id, data) {
  return apiFetch(`/${id}/review`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
