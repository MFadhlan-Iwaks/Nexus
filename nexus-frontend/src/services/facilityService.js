


import { getToken, getLocalUser } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const toFaskesView = (item) => {
  const kapasitas = Number(item.kapasitas_tersedia ?? item.stok ?? 0);
  return {
    ...item,
    id: item.id ?? item.id_faskes,
    nama: item.nama_fasilitas ?? item.nama_instansi_medis ?? item.nama,
    nama_fasilitas: item.nama_fasilitas ?? item.nama_instansi_medis ?? item.nama,
    stok: kapasitas,
    unit: item.satuan ?? item.unit ?? 'Bed',
    institusi: item.nama_instansi ?? item.lokasi ?? item.institusi ?? item.id_instansi,
    terakhir_update: item.updated_at ?? item.terakhir_update,
    kapasitas_tersedia: kapasitas,
    satuan: item.satuan ?? item.unit ?? 'Bed',
    lokasi: item.nama_instansi ?? item.lokasi ?? item.institusi ?? item.id_instansi,
    tipe: item.tipe ?? item.kategori,
    latitude: item.latitude !== null && item.latitude !== undefined ? Number(item.latitude) : item.latitude,
    longitude: item.longitude !== null && item.longitude !== undefined ? Number(item.longitude) : item.longitude,
  };
};



export function getFaskesStatus(kapasitas) {
  if (kapasitas <= 0) return 'Penuh';
  if (kapasitas <= 5) return 'Hampir Penuh';
  return 'Tersedia';
}


export async function getFacilities() {
  const token = getToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/faskes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil faskes.');

  return (data.data ?? []).map(toFaskesView);
}



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



export async function deleteFacility(id) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/faskes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus faskes.');
  return { message: data.message, id };
}



export async function getFacilitySummary() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/admin/faskes/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil ringkasan faskes.');
  return (data.data ?? []).map((g) => ({
    ...g,
    status: g.status || getFaskesStatus(g.availableCapacity || 0),
    updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  }));
}
