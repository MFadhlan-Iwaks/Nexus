// src/services/reportService.js
// ============================================================
// Service: Laporan Bencana
//
// ✅ BACKEND ASLI:
//   - createReport()         → POST /api/laporan/tambah
//   - getRiwayatMasyarakat() → GET  /api/laporan/riwayat
//
// 🟡 MOCK via shared store (TRC & Admin sync):
//   - getReports()           → baca dari store (shared)
//   - validateReport()       → tulis ke store → Admin ikut berubah
//   - updateReportProgress() → tulis ke store → Admin ikut berubah
//   - approveReport()        → tulis ke store
//   - rejectReport()         → tulis ke store
// ============================================================

import {
  getReportsState,
  patchReport,
  patchReportTrc,
} from '@/data/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ─── BACKEND ASLI ────────────────────────────────────────────

/**
 * Ambil riwayat laporan milik masyarakat yang sedang login.
 * ✅ Backend asli: GET /api/laporan/riwayat
 */
export async function getRiwayatMasyarakat() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const res = await fetch(`${API_BASE}/laporan/riwayat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil riwayat laporan.');
  return data.data ?? [];
}

/**
 * Buat laporan baru (masyarakat).
 * ✅ Backend asli: POST /api/laporan/tambah
 * @param {FormData} formData - kategori_bencana, deskripsi_kejadian, latitude, longitude, bukti_visual
 */
export async function createReport(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/laporan/tambah`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim laporan.');
  return data;
}

// ─── SHARED STORE (TRC ↔ Admin sync) ─────────────────────────

/**
 * Ambil semua laporan dari shared store.
 * 🟡 Mock — ganti saat backend siap:
 * TODO: GET /api/laporan
 */
export async function getReports() {
  await simulateDelay();
  return getReportsState();
}

/**
 * Ambil laporan berdasarkan ID dari shared store.
 */
export async function getReportById(id) {
  await simulateDelay(200);
  const report = getReportsState().find((r) => r.id === id);
  if (!report) throw new Error('Laporan tidak ditemukan.');
  return report;
}

/**
 * TRC: Validasi laporan — menulis ke shared store, Admin ikut berubah.
 * 🟡 Mock — TODO: PATCH /api/laporan/:id/validasi
 * @param {string} reportId
 * @param {{ status_validasi, skala_kedaruratan, fase_penanganan, catatan, foto_bukti, petugas, id }} payload
 */
export async function validateReport(reportId, payload) {
  await simulateDelay(300);
  // Tulis ke store → admin dashboard langsung terbaca
  const isValid = payload.status_validasi === 'valid';
  patchReport(reportId, { status: isValid ? 'menunggu_admin' : 'ditolak' });
  patchReportTrc(reportId, {
    status_validasi: payload.status_validasi,
    skala_kedaruratan: payload.skala_kedaruratan,
    fase_penanganan: payload.fase_penanganan ?? 'Identifikasi',
    catatan: payload.catatan ?? '',
    petugas: payload.petugas,
    id: payload.trcId,
    waktu_validasi: new Date().toISOString(),
  });
  return { message: 'Validasi berhasil dikirim ke Admin.', reportId };
}

/**
 * TRC: Update progres penanganan — menulis ke shared store.
 * 🟡 Mock — TODO: PATCH /api/laporan/:id/progres
 */
export async function updateReportProgress(reportId, payload) {
  await simulateDelay(300);
  const isSelesai = payload.fase_penanganan === 'Penanganan Selesai';
  patchReport(reportId, { status: isSelesai ? 'selesai' : 'diproses' });
  patchReportTrc(reportId, {
    fase_penanganan: payload.fase_penanganan,
    catatan: payload.catatan ?? '',
    waktu_update: new Date().toISOString(),
  });
  return { message: 'Progres diperbarui.', reportId };
}

/**
 * Admin: Setujui laporan.
 * 🟡 Mock — TODO: PATCH /api/laporan/:id/approve
 */
export async function approveReport(reportId) {
  await simulateDelay(200);
  patchReport(reportId, { status: 'diproses' });
  return { message: 'Laporan disetujui.', reportId };
}

/**
 * Admin: Tolak laporan.
 * 🟡 Mock — TODO: PATCH /api/laporan/:id/reject
 */
export async function rejectReport(reportId) {
  await simulateDelay(200);
  patchReport(reportId, { status: 'ditolak' });
  return { message: 'Laporan ditolak.', reportId };
}
