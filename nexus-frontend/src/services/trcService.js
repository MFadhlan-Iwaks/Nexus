
import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getTrcUnits() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/admin/trc`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil data TRC.');
  return data.data ?? [];
}

export async function getTrcLocations() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/admin/trc-locations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil lokasi TRC.');
  return data.data ?? [];
}

export async function postTrcLocation(payload) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/trc/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengirim lokasi TRC.');
  return data.data;
}

export async function deleteTrcLocation() {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/trc/location`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus lokasi TRC.');
  return data;
}

export async function getTrcUnitById(id) {
  const units = await getTrcUnits();
  const unit = units.find((t) => String(t.id) === String(id));
  if (!unit) throw new Error('Unit TRC tidak ditemukan.');
  return unit;
}
