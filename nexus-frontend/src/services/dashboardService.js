


import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';



export async function getDashboardStats() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengambil statistik dashboard.');
  return data.data;
}



export { getLogisticSummary } from '@/services/logisticService';



export { getFacilitySummary as getFaskesSummary } from '@/services/facilityService';
