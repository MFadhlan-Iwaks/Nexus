


import {
  addStockHistory,
} from '@/data/store';
import { getToken, getLocalUser } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';





export function getLogisticStatus(stok) {
  if (stok <= 0) return 'Habis';
  if (stok <= 100) return 'Menipis';
  return 'Aman';
}





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



export async function deleteLogistic(id) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/logistik/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus logistik.');
  return { message: data.message, id };
}





export async function getStockHistory() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/operator/riwayat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil riwayat stok.');
  return data.data ?? [];
}



export function recordStockHistory(entry) {
  addStockHistory({ ...entry, waktu: entry.waktu || new Date().toISOString() });
}





export async function getLogisticSummary() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/admin/logistik/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil ringkasan logistik.');
  return (data.data ?? []).map((g) => ({
    ...g,
    status: g.status || getLogisticStatus(g.availableStock || 0),
    updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  }));
}
