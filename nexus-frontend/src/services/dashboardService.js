// src/services/dashboardService.js
// ============================================================
// Service: Dashboard Statistik (Admin)
// Semua data dibaca dari shared store agar up-to-date
// ============================================================

import { getReportsState, getTrcUnitsState } from '@/data/store';
import { getLogisticSummary } from '@/services/logisticService';
import { getFacilitySummary } from '@/services/facilityService';

const simulateDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/**
 * Ambil statistik ringkasan dashboard admin dari shared store.
 */
export async function getDashboardStats() {
  await simulateDelay();
  const reports = getReportsState();
  const trcUnits = getTrcUnitsState();

  const totalLaporan = reports.length;
  const menunggu = reports.filter((r) => r.status === 'menunggu_admin').length;
  const diproses = reports.filter((r) => r.status === 'diproses').length;
  const selesai = reports.filter((r) => r.status === 'selesai').length;
  const ditolak = reports.filter((r) => r.status === 'ditolak').length;
  const totalTrcAktif = trcUnits.filter((t) => t.status === 'aktif').length;

  const logisticSummary = await getLogisticSummary();
  const faskesSummary = await getFacilitySummary();

  return {
    totalLaporan,
    menunggu,
    diproses,
    selesai,
    ditolak,
    totalTrcAktif,
    totalLogistikInstansi: logisticSummary.length,
    totalFaskesInstansi: faskesSummary.length,
  };
}

/**
 * Ringkasan logistik per institusi — re-export untuk kemudahan import di admin.
 */
export { getLogisticSummary } from '@/services/logisticService';

/**
 * Ringkasan faskes per institusi — re-export untuk kemudahan import di admin.
 */
export { getFacilitySummary as getFaskesSummary } from '@/services/facilityService';
