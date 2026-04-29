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
import { getToken, getLocalUser } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/logistik`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil logistik.');
  return (data.data ?? []).map((item) => ({
    id: item.id_logistik,
    nama: item.nama_barang,
    kategori: item.kategori || 'Umum',
    stok: Number(item.jumlah_stok ?? 0),
    unit: item.unit || 'Unit',
    institusi: item.id_instansi,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
  }));
}

/**
 * Tambah item logistik baru.
 * 🟡 Mock — TODO: POST /api/logistik
 * @param {{ nama, kategori, stok, unit, institusi }} data
 */
export async function createLogistic(data) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const user = getLocalUser();

  const res = await fetch(`${API_BASE}/logistik`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_instansi: user?.id_instansi || null,
      nama_barang: data.nama,
      kategori: data.kategori,
      unit: data.unit,
      jumlah_stok: Number(data.stok ?? 0),
    }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Gagal menambah logistik.');

  const item = result.data;
  const mapped = {
    id: item.id_logistik,
    nama: item.nama_barang,
    kategori: item.kategori || data.kategori || 'Umum',
    stok: Number(item.jumlah_stok ?? 0),
    unit: item.unit || data.unit || 'Unit',
    institusi: item.id_instansi,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
  };
  return { message: result.message, item: mapped };
}

/**
 * Update stok logistik.
 * 🟡 Mock — TODO: PATCH /api/logistik/:id
 * @param {string} id
 * @param {{ stok: number }} data
 */
export async function updateLogistic(id, data) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/logistik/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jumlah_stok: Number(data.stok ?? 0) }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Gagal memperbarui logistik.');
  return { message: result.message, id };
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
