// src/services/broadcastService.js
// ============================================================
// Service: Broadcast / Peringatan Dini
// Baca-tulis dari shared store (getBroadcastsState, addBroadcast)
// ============================================================

import { getBroadcastsState, addBroadcast, removeBroadcast } from '@/data/store';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/**
 * Ambil semua broadcast dari shared store.
 * 🟡 Mock — TODO: GET /api/peringatan
 */
export async function getBroadcasts() {
  await simulateDelay();
  return getBroadcastsState();
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
