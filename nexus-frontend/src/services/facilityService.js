// src/services/facilityService.js
// ============================================================
// Service: Fasilitas Kesehatan (Faskes)
// TERPISAH dari logisticService karena status berbeda:
//   Faskes: Tersedia | Hampir Penuh | Penuh
//   Logistik: Aman | Menipis | Habis
// ============================================================

import { getFaskesState, patchFaskes, addFaskes } from '@/data/store';

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
  await simulateDelay();
  return getFaskesState().map(toFaskesView);
}

/**
 * Tambah fasilitas baru.
 * 🟡 Mock — TODO: POST /api/faskes
 * @param {{ nama, kategori, stok, unit, institusi }} data
 */
export async function createFacility(data) {
  await simulateDelay(200);
  const newItem = {
    id: `FSK-${Date.now()}`,
    nama_fasilitas: data.nama_fasilitas ?? data.nama,
    kategori: data.kategori,
    kapasitas_total: Number(data.kapasitas_total ?? data.stok ?? 0),
    kapasitas_tersedia: Number(data.kapasitas_tersedia ?? data.stok ?? 0),
    satuan: data.satuan ?? data.unit ?? 'Bed',
    lokasi: data.lokasi ?? data.institusi,
    updated_at: new Date().toISOString(),
  };
  addFaskes(newItem);
  return { message: 'Fasilitas berhasil ditambahkan.', item: toFaskesView(newItem) };
}

/**
 * Update kapasitas fasilitas.
 * 🟡 Mock — TODO: PATCH /api/faskes/:id
 * @param {string} id
 * @param {{ stok: number }} data
 */
export async function updateFacility(id, data) {
  await simulateDelay(200);
  const kapasitas = Number(data.kapasitas_tersedia ?? data.stok ?? 0);
  patchFaskes(id, { kapasitas_tersedia: kapasitas, stok: kapasitas, updated_at: new Date().toISOString(), terakhir_update: new Date().toISOString() });
  return { message: 'Kapasitas berhasil diperbarui.', id };
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
