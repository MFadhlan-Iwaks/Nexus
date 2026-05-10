
import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function normalizeUser(item) {
  return {
    id: item.id_user,
    nama: item.nama_lengkap,
    role: String(item.role || '').toLowerCase(),
    no_hp: item.no_hp,
    alamat: item.alamat,
    wilayah: item.nama_instansi || item.id_instansi || '-',
    created_at: item.created_at || item.createdAt || null,
  };
}

export async function getUsers() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil user.');
  return (data.data ?? []).map(normalizeUser);
}

export async function updateUserRole(id, role) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengubah role.');
  return { message: data.message, id, role: data.data?.role || role };
}

export async function deleteUser(id) {
  const token = getToken();
  if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Gagal menghapus user.');
  return { message: data.message, id };
}
