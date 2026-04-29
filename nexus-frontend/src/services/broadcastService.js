// src/services/broadcastService.js
// ============================================================
// Service: Broadcast / Peringatan Dini
// Baca-tulis dari shared store (getBroadcastsState, addBroadcast)
// ============================================================

import { getBroadcastsState, addBroadcast, removeBroadcast } from '@/data/store';
import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function normalizeBroadcast(item) {
  if (!item) return null;
  return {
    id: item.id ?? item.id_peringatan ?? `bc-${Date.now()}`,
    pesan_peringatan: item.pesan_peringatan ?? '',
    waktu_kirim: item.waktu_kirim ?? new Date().toISOString(),
    level: item.level ?? 'sedang',
    target: item.target ?? '- ',
    pengirim: item.pengirim ?? 'BPBD',
  };
}

/**
 * Ambil semua broadcast dari backend.
 * ✅ Backend: GET /api/peringatan (auth required)
 */
export async function getBroadcasts() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/peringatan`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil peringatan dini.');
  return (data.data ?? []).map(normalizeBroadcast);
}

/**
 * Kirim broadcast peringatan dini (Admin only).
 * 🟡 Mock — TODO: POST /api/peringatan
 * @param {{ pesan_peringatan, level, target_scope, target_nama, pengirim }} payload
 */
export async function createBroadcast(payload) {
  await simulateDelay(300);
  const newBroadcast = {
    id: `bc-${Date.now()}`,
    pesan_peringatan: payload.pesan_peringatan,
    level: payload.level,
    target: `${payload.target_scope}: ${payload.target_nama || '-'}`,
    pengirim: payload.pengirim || 'Admin',
    waktu_kirim: new Date().toISOString(),
  };
  addBroadcast(newBroadcast);
  return { message: 'Broadcast berhasil dikirim.', broadcast: newBroadcast };
}

/**
 * Hapus broadcast (Admin only).
 * 🟡 Mock — TODO: DELETE /api/peringatan/:id
 */
export async function deleteBroadcast(id) {
  await simulateDelay(200);
  removeBroadcast(id);
  return { message: 'Broadcast berhasil dihapus.', id };
}
