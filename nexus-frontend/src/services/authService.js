


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function normalizeUser(user, fallback = {}) {
  if (!user) return null;
  return {
    id: user.id ?? user.id_user ?? fallback.id ?? null,
    nama: user.nama ?? user.nama_lengkap ?? fallback.nama ?? null,
    role: user.role ?? fallback.role ?? null,
    no_hp: user.no_hp ?? fallback.no_hp ?? null,
    alamat: user.alamat ?? fallback.alamat ?? null,
    id_instansi: user.id_instansi ?? fallback.id_instansi ?? null,
  };
}



export async function login({ no_hp, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ no_hp, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login gagal.');
  return {
    token: data.token,
    user: normalizeUser(data.user, { no_hp }),
  };
}



export async function register({ nama_lengkap, no_hp, alamat, password }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama_lengkap, no_hp, alamat, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registrasi gagal.');
  return {
    message: data.message,
    user: normalizeUser(data.user, { no_hp, alamat, nama: nama_lengkap }),
  };
}



export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal ambil profil.');
  return data.user;
}



export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}



export function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (token) {
    document.cookie = `token=${encodeURIComponent(String(token))}; path=/; samesite=lax`;
  }
  if (user?.role) {
    document.cookie = `role=${encodeURIComponent(String(user.role))}; path=/; samesite=lax`;
  }
}



export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; Max-Age=0; path=/; samesite=lax';
  document.cookie = 'role=; Max-Age=0; path=/; samesite=lax';
}



export function getLocalUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}
