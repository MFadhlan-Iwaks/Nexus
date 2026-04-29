// src/services/authService.js
// ============================================================
// Service: Authentication
// Ganti isi fungsi di bawah dengan fetch/axios ke API asli.
// Struktur return value harus tetap konsisten.
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function normalizeUser(user, fallback = {}) {
  if (!user) return null;
  return {
    id: user.id ?? user.id_user ?? fallback.id ?? null,
    nama: user.nama ?? user.nama_lengkap ?? fallback.nama ?? null,
    role: user.role ?? fallback.role ?? null,
    no_hp: user.no_hp ?? fallback.no_hp ?? null,
    alamat: user.alamat ?? fallback.alamat ?? null,
  };
}

/**
 * Login user dengan no_hp dan password.
 * @returns {{ token: string, user: { id, nama, role, no_hp } }}
 */
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

/**
 * Register user baru.
 * @returns {{ message: string, user: { id, nama, role, no_hp, alamat } }}
 */
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

/**
 * Ambil profil user dari token (dipakai saat pertama kali load).
 * @returns {{ id, nama, role, no_hp, email, wilayah }}
 */
export async function getProfile(token) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal ambil profil.');
  return data.user;
}

/**
 * Ambil token dari localStorage (helper).
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Simpan session setelah login.
 */
export function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Hapus session saat logout.
 */
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Baca user dari localStorage.
 */
export function getLocalUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}
