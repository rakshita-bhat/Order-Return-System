const BASE_URL = '/api/auth';

async function parseError(res) {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    return body.error || (body.fieldErrors ? JSON.stringify(body.fieldErrors) : 'Request failed');
  } catch {
    return text || `Error ${res.status}`;
  }
}

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function refreshToken(token) {
  const res = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
