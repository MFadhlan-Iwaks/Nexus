// src/services/logisticService.js
// ============================================================
// Service: Logistik (bukan faskes)
// Status: Aman | Menipis | Habis
// Untuk faskes gunakan facilityService.js (status berbeda)
// ============================================================

import {
  getLogisticsState,
  patchLogistic,
  addLogistic,
  getStockHistoryState,
  addStockHistory,
} from '@/data/store';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── STATUS HELPER ─────────────────────────────────────────

/**
 * Hitung status logistik berdasarkan jumlah stok.
 * @param {number} stok
 * @returns {'Aman'|'Menipis'|'Habis'}
 */
export function getLogisticStatus(stok) {
  if (stok <= 0) return 'Habis';
  if (stok <= 100) return 'Menipis';
  return 'Aman';
}

// ─── LOGISTIK ──────────────────────────────────────────────

/**
 * Ambil semua item logistik dari shared store.
 * 🟡 Mock — TODO: GET /api/logistik
 */
export async function getLogistics() {
  await simulateDelay();
  return getLogisticsState();
}

/**
 * Tambah item logistik baru.
 * 🟡 Mock — TODO: POST /api/logistik
 * @param {{ nama, kategori, stok, unit, institusi }} data
 */
export async function createLogistic(data) {
  await simulateDelay(200);
  const newItem = {
    id: `log-${Date.now()}`,
    ...data,
    stok: Number(data.stok),
    terakhir_update: new Date().toISOString(),
  };
  addLogistic(newItem);
  return { message: 'Item berhasil ditambahkan.', item: newItem };
}

/**
 * Update stok logistik.
 * 🟡 Mock — TODO: PATCH /api/logistik/:id
 * @param {string} id
 * @param {{ stok: number }} data
 */
export async function updateLogistic(id, data) {
  await simulateDelay(200);
  patchLogistic(id, { stok: Number(data.stok), terakhir_update: new Date().toISOString() });
  return { message: 'Stok berhasil diperbarui.', id };
}

/**
 * Hapus item logistik.
 * 🟡 Mock — TODO: DELETE /api/logistik/:id
 */
export async function deleteLogistic(id) {
  await simulateDelay(200);
  return { message: 'Item berhasil dihapus.', id };
}

// ─── RIWAYAT STOK ─────────────────────────────────────────

/**
 * Ambil riwayat aktivitas stok dari shared store.
 * 🟡 Mock — TODO: GET /api/logistik/riwayat
 */
export async function getStockHistory() {
  await simulateDelay();
  return getStockHistoryState();
}

/**
 * Tambah entri riwayat stok.
 */
export function recordStockHistory(entry) {
  addStockHistory({ ...entry, waktu: entry.waktu || new Date().toISOString() });
}

// ─── SUMMARY (untuk Admin) ─────────────────────────────────

/**
 * Ringkasan logistik per institusi (untuk Admin dashboard).
 * 🟡 Mock — TODO: GET /api/logistik/summary
 */
export async function getLogisticSummary() {
  await simulateDelay();
  const items = getLogisticsState();
  const grouped = items.reduce((acc, item) => {
    const key = item.institusi || 'Umum';
    if (!acc[key]) acc[key] = { institution: key, totalItems: 0, availableStock: 0, id: key };
    acc[key].totalItems += 1;
    acc[key].availableStock += item.stok || 0;
    return acc;
  }, {});
  return Object.values(grouped).map((g) => ({
    ...g,
    status: getLogisticStatus(g.availableStock),
    updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  }));
}
