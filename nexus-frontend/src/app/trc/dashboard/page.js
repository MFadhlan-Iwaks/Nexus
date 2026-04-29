'use client';

// src/app/trc/dashboard/page.js
// TRC: validasi dan update progres menulis ke shared store → admin ikut berubah

import { useState, useCallback } from 'react';
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
function mapReportToTask(report) {
  const m = report?.masyarakat || {};
  const t = report?.trc || {};
  return {
    id: report?.id || '-',
    status: report?.status === 'menunggu_admin' || report?.status === 'diproses'
      ? (t.status_validasi ? 'penanganan' : 'menunggu')
      : report?.status === 'selesai' ? 'selesai' : 'menunggu',
    kategori: m.kategori || 'Tidak Diketahui',
    judul: `${m.kategori || 'Insiden'} — ${report?.id || ''}`,
    lokasi: `${m.latitude?.toFixed(4) ?? '-'}, ${m.longitude?.toFixed(4) ?? '-'}`,
    koordinat: `${m.latitude ?? '-'}, ${m.longitude ?? '-'}`,
    deskripsi: m.deskripsi || '-',
    waktu: m.waktu_lapor ? new Date(m.waktu_lapor).toLocaleString('id-ID') : '-',
    pelapor: m.nama || 'Anonim',
    foto: m.foto || null,
    trc: t,
    jarak: '~1-3 km',
  };
}

export default function TRCDashboard() {
  const [activeTab, setActiveTab] = useState('baru');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // State laporan lokal agar UI update langsung setelah aksi TRC
  const [localTasks, setLocalTasks] = useState(null);

  const { loading, error, refetch } = useAsync(async () => {
    const reports = await getReports();
    setLocalTasks(reports.map(mapReportToTask));
  }, []);

  const tasks = localTasks || [];

  const laporanBaruCount = tasks.filter((t) => t.status === 'menunggu').length;
  const tugasAktifCount = tasks.filter((t) => t.status === 'penanganan').length;

  const filteredTasks = tasks.filter((t) =>
    activeTab === 'baru' ? t.status === 'menunggu' : t.status === 'penanganan'
  );

  // Callback setelah validasi → update status task di UI
  const handleValidationSuccess = useCallback(({ id, status_validasi }) => {
    setLocalTasks((prev) =>
      prev?.map((t) =>
        t.id !== id ? t : {
          ...t,
          status: status_validasi === 'valid' ? 'penanganan' : 'selesai',
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
              <p className="text-slate-500 text-sm">Lokasi: {mockTrcProfile.lokasi || 'Kec. Tawang'}</p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ↻ Refresh
          </button>
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
            title={activeTab === 'baru' ? 'Tidak Ada Laporan Baru' : 'Tidak Ada Tugas Aktif'}
            description={activeTab === 'baru'
              ? 'Semua laporan masuk sudah divalidasi.'
              : 'Belum ada tugas aktif saat ini.'}
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
