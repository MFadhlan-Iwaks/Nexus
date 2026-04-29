// src/services/reportService.js
// ============================================================
// Service: Laporan Bencana
//
// ✅ BACKEND ASLI:
//   - createReport()         → POST /api/laporan/tambah
//   - getRiwayatMasyarakat() → GET  /api/laporan/riwayat
//   - getReports()           → GET  /api/laporan/all
//   - validateReport()       → PATCH /api/laporan/validasi/:id
//   - updateReportProgress() → PATCH /api/laporan/update/:id
// ============================================================

import { patchReport, patchReportTrc } from '@/data/store';
import { getToken } from '@/services/authService';

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

// ─── TRC / OPERATOR ─────────────────────────────────────────

/**
 * Ambil semua laporan.
 * ✅ Backend: GET /api/laporan/all
 */
export async function getReports() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/laporan/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil laporan.');
  return data.data ?? [];
}

/**
 * Ambil laporan berdasarkan ID.
 */
export async function getReportById(id) {
  const reports = await getReports();
  const report = reports.find((r) => String(r.id_laporan ?? r.id) === String(id));
  if (!report) throw new Error('Laporan tidak ditemukan.');
  return report;
}

/**
 * TRC: Validasi laporan.
 * ✅ Backend: PATCH /api/laporan/validasi/:id
 * @param {string} reportId
 * @param {{ status_validasi, skala_kedaruratan, catatan }} payload
 */
export async function validateReport(reportId, payload) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');

  const isValid = payload.status_validasi === 'valid';
  const formData = new FormData();
  formData.append('is_valid', String(isValid));
  if (payload.catatan) formData.append('keterangan', payload.catatan);
  if (payload.skala_kedaruratan) formData.append('skala_darurat', payload.skala_kedaruratan);
  if (payload.foto_validasi) formData.append('foto_validasi', payload.foto_validasi);

  const res = await fetch(`${API_BASE}/laporan/validasi/${reportId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memvalidasi laporan.');
  return data;
}

/**
 * TRC: Update progres penanganan.
 * ✅ Backend: PATCH /api/laporan/update/:id
 */
export async function updateReportProgress(reportId, payload) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');

  const isSelesai = payload.fase_penanganan === 'Penanganan Selesai';
  const formData = new FormData();
  formData.append('status', isSelesai ? 'Selesai' : 'Diproses');
  formData.append('fase_penanganan', payload.fase_penanganan);
  if (payload.catatan) formData.append('pesan_situasi', payload.catatan);
  if (payload.foto_progress) formData.append('foto_progress', payload.foto_progress);

  const res = await fetch(`${API_BASE}/laporan/update/${reportId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui progres.');
  return data;
}

// ─── ADMIN MOCK (masih memakai store) ───────────────────────

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

/**
 * Shared store update (digunakan oleh UI mock tertentu).
 */
export function patchReportLocal(reportId, changes, trcChanges) {
  if (changes) patchReport(reportId, changes);
  if (trcChanges) patchReportTrc(reportId, trcChanges);
}
