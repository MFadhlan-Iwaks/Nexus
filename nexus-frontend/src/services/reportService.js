


import { patchReport, patchReportTrc } from '@/data/store';
import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const simulateDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));





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





export async function getReports() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/laporan/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil laporan.');
  const baseUrl = API_BASE.replace(/\/+api\/?$/, '');
  return (data.data ?? []).map((row) => {
    const statusRaw = String(row.status || '').toLowerCase();
    const statusMap = {
      menunggu: 'menunggu_admin',
      diproses: 'diproses',
      selesai: 'selesai',
      ditolak: 'ditolak',
    };

    const buktiVisual = row.bukti_visual ? `${baseUrl}/uploads/${row.bukti_visual}` : null;
    const fotoValidasi = row.foto_validasi ? `${baseUrl}/uploads/${row.foto_validasi}` : null;
    const fotoProgress = row.foto_progress ? `${baseUrl}/uploads/${row.foto_progress}` : null;

    const statusValidasi = statusRaw === 'ditolak' ? 'hoax' : row.skala_darurat ? 'valid' : '-';

    return {
      id: row.id_laporan,
      status: statusMap[statusRaw] || statusRaw || 'menunggu_admin',
      masyarakat: {
        nama: row.nama_lengkap,
        contact: row.no_hp,
        kategori: row.kategori_bencana,
        deskripsi: row.deskripsi_kejadian,
        waktu_lapor: row.waktu_laporan,
        foto: buktiVisual,
        latitude: row.latitude,
        longitude: row.longitude,
      },
      trc: {
        id: row.id_user_trc || null,
        petugas: row.nama_trc || null,
        status_validasi: statusValidasi,
        skala_kedaruratan: row.skala_darurat || null,
        fase_penanganan: row.fase_penanganan || null,
        catatan: row.pesan_situasi || row.keterangan_validasi || null,
        waktu_validasi: row.waktu_validasi || null,
        waktu_update: row.waktu_update || null,
        foto_bukti: fotoValidasi,
        foto_progress: fotoProgress,
      },
    };
  });
}



export async function getReportById(id) {
  const reports = await getReports();
  const report = reports.find((r) => String(r.id_laporan ?? r.id) === String(id));
  if (!report) throw new Error('Laporan tidak ditemukan.');
  return report;
}



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
  if (!res.ok) throw new Error(data.message || data.error || 'Gagal memperbarui progres.');
  if (data.data?.foto_progress) {
    const baseUrl = API_BASE.replace(/\/+api\/?$/, '');
    data.data.foto_progress_url = `${baseUrl}/uploads/${data.data.foto_progress}`;
  }
  return data;
}





export async function approveReport(reportId) {
  await simulateDelay(200);
  patchReport(reportId, { status: 'diproses' });
  return { message: 'Laporan disetujui.', reportId };
}



export async function rejectReport(reportId) {
  await simulateDelay(200);
  patchReport(reportId, { status: 'ditolak' });
  return { message: 'Laporan ditolak.', reportId };
}



export function patchReportLocal(reportId, changes, trcChanges) {
  if (changes) patchReport(reportId, changes);
  if (trcChanges) patchReportTrc(reportId, trcChanges);
}
