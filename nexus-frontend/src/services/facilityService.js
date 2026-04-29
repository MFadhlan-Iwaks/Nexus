// src/services/facilityService.js
// ============================================================
// Service: Fasilitas Kesehatan (Faskes)
// TERPISAH dari logisticService karena status berbeda:
//   Faskes: Tersedia | Hampir Penuh | Penuh
//   Logistik: Aman | Menipis | Habis
// ============================================================

import { getFaskesState, patchFaskes, addFaskes } from '@/data/store';

const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

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
  return getFaskesState();
}

/**
 * Tambah fasilitas baru.
 * 🟡 Mock — TODO: POST /api/faskes
 * @param {{ nama, kategori, stok, unit, institusi }} data
 */
export async function createFacility(data) {
  await simulateDelay(200);
  const newItem = {
    id: `fsk-${Date.now()}`,
    ...data,
    stok: Number(data.stok),
    terakhir_update: new Date().toISOString(),
  };
  addFaskes(newItem);
  return { message: 'Fasilitas berhasil ditambahkan.', item: newItem };
}

/**
 * Update kapasitas fasilitas.
 * 🟡 Mock — TODO: PATCH /api/faskes/:id
 * @param {string} id
 * @param {{ stok: number }} data
 */
export async function updateFacility(id, data) {
  await simulateDelay(200);
  patchFaskes(id, { stok: Number(data.stok), terakhir_update: new Date().toISOString() });
  return { message: 'Kapasitas berhasil diperbarui.', id };
}

/**
 * Ringkasan faskes per institusi (untuk Admin).
 * 🟡 Mock — TODO: GET /api/faskes/summary
 */
export async function getFacilitySummary() {
  await simulateDelay();
  const items = getFaskesState();
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
