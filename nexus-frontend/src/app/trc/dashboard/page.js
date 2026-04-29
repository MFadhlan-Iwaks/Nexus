'use client';

// src/app/trc/dashboard/page.js
// TRC: validasi dan update progres menulis ke shared store → admin ikut berubah

import { useState, useCallback, useEffect } from 'react';
import { Radio, ClipboardList } from 'lucide-react';
import TRCNavbar from '@/components/trc/TRCNavbar';
import TaskCard from '@/components/trc/TaskCard';
import ValidationModal from '@/components/trc/ValidationModal';
import TaskDetailModal from '@/components/trc/TaskDetailModal';
import UpdateProgressModal from '@/components/trc/UpdateProgressModal';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';
import { getReports } from '@/services/reportService';
import { mockTrcProfile } from '@/data/mockData';

// Mapper: format dari mockReports → format TaskCard
function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeStatus(rawStatus, trcStatus) {
  const s = String(rawStatus || '').toLowerCase();
  if (s.includes('menunggu')) return 'menunggu';
  if (s.includes('diproses')) return 'penanganan';
  if (s.includes('ditolak')) return 'ditolak';
  if (s.includes('selesai')) return 'selesai';
  if (trcStatus) return 'penanganan';
  return 'menunggu';
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function calcDistanceKm(from, to) {
  if (!from || !to) return null;
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLat = lat2 - lat1;
  const dLon = toRadians(to.lon - from.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function formatDistance(km) {
  if (!Number.isFinite(km)) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

const uploadBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

function mapReportToTask(report, trcCoords) {
  const m = report?.masyarakat || {};
  const t = report?.trc || {};
  const latitude = toNumber(report?.latitude ?? m.latitude);
  const longitude = toNumber(report?.longitude ?? m.longitude);
  const mapsUrl = latitude !== null && longitude !== null
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  const kategori = report?.kategori_bencana ?? m.kategori;
  const deskripsi = report?.deskripsi_kejadian ?? m.deskripsi;
  const waktuRaw = report?.waktu_laporan ?? m.waktu_lapor;
  const pelapor = report?.nama_lengkap ?? m.nama;
  const foto = report?.bukti_visual
    ? `${uploadBase}/uploads/${report.bukti_visual}`
    : (m.foto || null);
  const reportId = report?.id_laporan ?? report?.id;
  const distanceKm = trcCoords && latitude !== null && longitude !== null
    ? calcDistanceKm(trcCoords, { lat: latitude, lon: longitude })
    : null;

  return {
    id: reportId || '-',
    status: normalizeStatus(report?.status, t.status_validasi),
    kategori: kategori || 'Tidak Diketahui',
    judul: `${kategori || 'Insiden'} — ${reportId || ''}`,
    lokasi: latitude !== null && longitude !== null
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : '-, -',
    koordinat: latitude !== null && longitude !== null
      ? `${latitude}, ${longitude}`
      : '-, -',
    deskripsi: deskripsi || '-',
    waktu: waktuRaw ? new Date(waktuRaw).toLocaleString('id-ID') : '-',
    pelapor: pelapor || 'Anonim',
    foto: foto || null,
    trc: t,
    jarak: formatDistance(distanceKm),
    mapsUrl,
  };
}

export default function TRCDashboard() {
  const [activeTab, setActiveTab] = useState('baru');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [trcCoords, setTrcCoords] = useState(null);

  // State laporan lokal agar UI update langsung setelah aksi TRC
  const [localTasks, setLocalTasks] = useState(null);

  useEffect(() => {
    if (!geoEnabled || !navigator.geolocation) {
      setTrcCoords(null);
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setTrcCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setTrcCoords(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [geoEnabled]);

  const { loading, error, refetch } = useAsync(async () => {
    const reports = await getReports();
    setLocalTasks(reports.map((r) => mapReportToTask(r, trcCoords)));
  }, [trcCoords]);

  const tasks = localTasks || [];

  const laporanBaruCount = tasks.filter((t) => t.status === 'menunggu').length;
  const tugasAktifCount = tasks.filter((t) => t.status === 'penanganan').length;
  const tugasDitolakCount = tasks.filter((t) => t.status === 'ditolak').length;

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'baru') return t.status === 'menunggu';
    if (activeTab === 'aktif') return t.status === 'penanganan';
    return t.status === 'ditolak';
  });

  // Callback setelah validasi → update status task di UI
  const handleValidationSuccess = useCallback(({ id, status_validasi }) => {
    setLocalTasks((prev) =>
      prev?.map((t) =>
        t.id !== id ? t : {
          ...t,
          status: status_validasi === 'valid' ? 'penanganan' : 'ditolak',
          trc: { ...t.trc, status_validasi },
        }
      )
    );
  }, []);

  // Callback setelah update progres → update fase di UI
  const handleProgressSuccess = useCallback(({ id, fase_penanganan, catatan, status }) => {
    setLocalTasks((prev) =>
      prev?.map((t) =>
        t.id !== id ? t : {
          ...t,
          status,
          trc: {
            ...t.trc,
            fase_penanganan,
            catatan,
            waktu_update: new Date().toISOString(),
          },
        }
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <TRCNavbar profile={mockTrcProfile} />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6">

        {/* Header Operasi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operasi Lapangan</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                <Radio size={12} className="animate-pulse" /> Live Tracking Aktif
              </span>
              <p className="text-slate-500 text-sm">
                Lokasi: {trcCoords
                  ? `${trcCoords.lat.toFixed(5)}, ${trcCoords.lon.toFixed(5)}`
                  : (mockTrcProfile.lokasi || 'Kec. Tawang')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
              <span className={`text-xs font-bold ${geoEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                Geotagging {geoEnabled ? 'ON' : 'OFF'}
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={geoEnabled}
                  onChange={(e) => setGeoEnabled(e.target.checked)}
                />
                <span className={`w-10 h-5 rounded-full transition-colors ${geoEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${geoEnabled ? 'translate-x-5' : 'translate-x-1'} mt-0.5`} />
                </span>
              </label>
            </div>
            <button
              onClick={refetch}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-slate-200 mb-6">
          {[
            { id: 'baru', label: 'Laporan Baru (Validasi)', count: laporanBaruCount, activeClass: 'text-slate-900', barClass: 'bg-slate-900' },
            { id: 'aktif', label: 'Tugas Aktif (Penanganan)', count: tugasAktifCount, activeClass: 'text-blue-600', barClass: 'bg-blue-600' },
          ].map(({ id, label, count, activeClass, barClass }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === id ? activeClass : 'text-slate-500 hover:text-slate-700'}`}
            >
              {label}
              <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px]">
                {count}
              </span>
              {activeTab === id && (
                <div className={`absolute bottom-0 left-0 w-full h-0.5 ${barClass} rounded-t-full`} />
              )}
            </button>
          ))}
        </div>

        {/* Konten */}
        {loading && <LoadingState message="Memuat laporan lapangan..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && filteredTasks.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title={activeTab === 'baru'
              ? 'Tidak Ada Laporan Baru'
              : activeTab === 'aktif'
                ? 'Tidak Ada Tugas Aktif'
                : 'Tidak Ada Tugas Ditolak'}
            description={activeTab === 'baru'
              ? 'Semua laporan masuk sudah divalidasi.'
              : activeTab === 'aktif'
                ? 'Belum ada tugas aktif saat ini.'
                : 'Belum ada laporan yang ditolak.'}
          />
        )}

        {!loading && !error && filteredTasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                data={task}
                onValidate={(t) => { setSelectedTask(t); setIsValidationModalOpen(true); }}
                onUpdate={(t) => { setSelectedTask(t); setIsUpdateModalOpen(true); }}
                onDetail={(t) => { setSelectedTask(t); setIsDetailModalOpen(true); }}
                canValidate={geoEnabled}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <ValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => { setIsValidationModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
        onSuccess={handleValidationSuccess}
      />
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
        onOpenValidation={(t) => {
          setIsDetailModalOpen(false);
          setSelectedTask(t);
          setIsValidationModalOpen(true);
        }}
        onOpenUpdate={(t) => {
          setIsDetailModalOpen(false);
          setSelectedTask(t);
          setIsUpdateModalOpen(true);
        }}
        canValidate={geoEnabled}
      />
      <UpdateProgressModal
        isOpen={isUpdateModalOpen}
        onClose={() => { setIsUpdateModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
        onSuccess={handleProgressSuccess}
      />
    </div>
  );
}
