// src/services/dashboardService.js
// ============================================================
// Service: Dashboard Statistik (Admin)
// Semua data dibaca dari shared store agar up-to-date
// ============================================================

import { getToken } from '@/services/authService';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Ambil statistik ringkasan dashboard admin dari shared store.
 */
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

/**
 * Ringkasan logistik per institusi — re-export untuk kemudahan import di admin.
 */
export { getLogisticSummary } from '@/services/logisticService';

/**
 * Ringkasan faskes per institusi — re-export untuk kemudahan import di admin.
 */
export { getFacilitySummary as getFaskesSummary } from '@/services/facilityService';
