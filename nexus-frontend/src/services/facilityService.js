// src/services/facilityService.js
// ============================================================
// Service: Fasilitas Kesehatan (Faskes)
// TERPISAH dari logisticService karena status berbeda:
//   Faskes: Tersedia | Hampir Penuh | Penuh
//   Logistik: Aman | Menipis | Habis
// ============================================================

import { getFaskesState, patchFaskes, addFaskes } from '@/data/store';
import { getToken, getLocalUser } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const toFaskesView = (item) => {
  const kapasitas = Number(item.kapasitas_tersedia ?? item.stok ?? 0);
  return {
    ...item,
    nama: item.nama_fasilitas ?? item.nama,
    stok: kapasitas,
    unit: item.satuan ?? item.unit ?? 'Bed',
    institusi: item.lokasi ?? item.institusi,
    terakhir_update: item.updated_at ?? item.terakhir_update,
    kapasitas_tersedia: kapasitas,
    satuan: item.satuan ?? item.unit ?? 'Bed',
    lokasi: item.lokasi ?? item.institusi,
  };
};

/**
 * Hitung status faskes berdasarkan kapasitas tersedia.
 * @param {number} kapasitas - jumlah bed/kapasitas tersedia
 * @returns {'Tersedia'|'Hampir Penuh'|'Penuh'}
 */
export function getFaskesStatus(kapasitas) {
  if (kapasitas <= 0) return 'Penuh';
  if (kapasitas <= 5) return 'Hampir Penuh';
  return 'Tersedia';
}

/**
 * Ambil semua fasilitas kesehatan dari shared store.
 * 🟡 Mock — TODO: GET /api/faskes
 */
export async function getFacilities() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/faskes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil faskes.');
  return (data.data ?? []).map((item) => toFaskesView({
    id: item.id_faskes,
    nama_fasilitas: item.nama_instansi_medis,
    kategori: item.kategori,
    kapasitas_tersedia: item.kapasitas_tersedia,
    satuan: item.unit,
    lokasi: item.id_instansi,
    updated_at: item.updated_at,
    latitude: item.latitude,
    longitude: item.longitude,
  }));
}

/**
 * Tambah fasilitas baru.
 * 🟡 Mock — TODO: POST /api/faskes
 * @param {{ nama, kategori, stok, unit, institusi }} data
 */
export async function createFacility(data) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const user = getLocalUser();

  const res = await fetch(`${API_BASE}/faskes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_instansi: user?.id_instansi || null,
      nama_instansi_medis: data.nama_fasilitas ?? data.nama,
      kategori: data.kategori,
      unit: data.satuan ?? data.unit ?? 'Bed',
      kapasitas_tersedia: Number(data.kapasitas_tersedia ?? data.stok ?? 0),
    }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Gagal menambah faskes.');

  const item = result.data;
  return {
    message: result.message,
    item: toFaskesView({
      id: item.id_faskes,
      nama_fasilitas: item.nama_instansi_medis,
      kategori: item.kategori || data.kategori,
      kapasitas_tersedia: item.kapasitas_tersedia,
      satuan: item.unit || data.satuan || data.unit || 'Bed',
      lokasi: item.id_instansi,
      updated_at: item.updated_at,
    }),
  };
}

/**
 * Update kapasitas fasilitas.
 * 🟡 Mock — TODO: PATCH /api/faskes/:id
 * @param {string} id
 * @param {{ stok: number }} data
 */
export async function updateFacility(id, data) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const kapasitas = Number(data.kapasitas_tersedia ?? data.stok ?? 0);
  const res = await fetch(`${API_BASE}/faskes/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ kapasitas_tersedia: kapasitas }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Gagal memperbarui faskes.');
  return { message: result.message, id };
}

/**
 * Ringkasan faskes per institusi (untuk Admin).
 * 🟡 Mock — TODO: GET /api/faskes/summary
 */
export async function getFacilitySummary() {
  await simulateDelay();
  const items = getFaskesState().map(toFaskesView);
  // Kelompokkan per institusi
  const grouped = items.reduce((acc, item) => {
    const key = item.institusi || 'Umum';
    if (!acc[key]) acc[key] = { institution: key, totalUnits: 0, availableCapacity: 0, id: key };
    acc[key].totalUnits += 1;
    acc[key].availableCapacity += item.stok || 0;
    return acc;
  }, {});
  return Object.values(grouped).map((g) => ({
    ...g,
    status: getFaskesStatus(g.availableCapacity),
    updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  }));
}
