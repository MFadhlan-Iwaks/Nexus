"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Radio, Loader2 } from 'lucide-react'; 
import TRCNavbar from '@/components/trc/TRCNavbar';
import TaskCard from '@/components/trc/TaskCard';
import ValidationModal from '@/components/trc/ValidationModal';
import TaskDetailModal from '@/components/trc/TaskDetailModal';
import UpdateProgressModal from '@/components/trc/UpdateProgressModal'; 

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function TRCDashboard() {
  const [activeTab, setActiveTab] = useState('baru');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiveTrackingOn, setIsLiveTrackingOn] = useState(false);
  const [trcCoords, setTrcCoords] = useState(null);
  const [trackingAccuracy, setTrackingAccuracy] = useState(null);
  const [trackingUpdatedAt, setTrackingUpdatedAt] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [isSubmittingValidation, setIsSubmittingValidation] = useState(false);
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const normalizeTaskStatus = (rawStatus) => {
    const statusLower = String(rawStatus || '').trim().toLowerCase();

    if (statusLower === 'menunggu') return 'menunggu';
    if (statusLower === 'diproses' || statusLower === 'penanganan' || statusLower === 'dalam penanganan') return 'penanganan';
    if (statusLower === 'ditolak' || statusLower === 'ditolah') return 'ditolak';
    return 'selesai';
  };

  useEffect(() => {
    if (!isLiveTrackingOn) {
      setTrcCoords(null);
      setTrackingAccuracy(null);
      setTrackingUpdatedAt(null);
      setTrackingError('');
      return;
    }

    if (!navigator.geolocation) {
      setTrackingError('Browser tidak mendukung GPS/geolocation.');
      setIsLiveTrackingOn(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setTrackingError('');
        setTrcCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setTrackingAccuracy(Math.round(position.coords.accuracy));
        setTrackingUpdatedAt(new Date());
      },
      (error) => {
        if (error.code === 1) {
          setTrackingError('Izin lokasi ditolak. Aktifkan permission lokasi untuk validasi.');
        } else {
          setTrackingError('Gagal mengambil lokasi real-time.');
        }
        setTrcCoords(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isLiveTrackingOn]);

  const fetchSemuaLaporan = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/laporan/all', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal mengambil data laporan');
      }

      const formattedTasks = result.data.map((laporan) => {
        const mappedStatus = normalizeTaskStatus(laporan.status);
        const lat = Number(laporan.latitude);
        const lng = Number(laporan.longitude);

        return {
          id: laporan.id_laporan,
          rawStatus: laporan.status,
          status: mappedStatus,
          kategori: laporan.kategori_bencana,
          judul: `Laporan ${laporan.kategori_bencana}`,
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lng) ? lng : null,
          deskripsi: laporan.deskripsi_kejadian,
          waktu: new Date(laporan.waktu_laporan).toLocaleString('id-ID'),
          pelapor: `${laporan.nama_lengkap} (${String(laporan.no_hp || '').slice(0, 4)}***)`,
          fasePenanganan: laporan.fase_penanganan || '-',
          jarak: 'N/A',
          lokasi: Number.isFinite(lat) && Number.isFinite(lng) ? `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` : 'Lokasi tidak tersedia',
          koordinat: Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : '-',
          mapsUrl: Number.isFinite(lat) && Number.isFinite(lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null,
          foto: laporan.bukti_visual ? `http://localhost:5000/uploads/${encodeURIComponent(laporan.bukti_visual)}` : null,
          fotoProgress: laporan.foto_progress ? `http://localhost:5000/uploads/${laporan.foto_progress}` : null
        };
      });

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Gagal memuat laporan:', error);
      alert('Gagal memuat data laporan masyarakat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemuaLaporan();
  }, [fetchSemuaLaporan]);

  const tasksWithDistance = useMemo(() => {
    return tasks.map((task) => {
      const hasTaskCoords = Number.isFinite(task.latitude) && Number.isFinite(task.longitude);
      const hasTrcCoords = Number.isFinite(trcCoords?.latitude) && Number.isFinite(trcCoords?.longitude);

      const jarakKm = hasTaskCoords && hasTrcCoords
        ? calculateDistanceKm(trcCoords.latitude, trcCoords.longitude, task.latitude, task.longitude)
        : null;

      return {
        ...task,
        lokasi: hasTaskCoords ? `Lat ${task.latitude.toFixed(5)}, Lng ${task.longitude.toFixed(5)}` : 'Lokasi tidak tersedia',
        koordinat: hasTaskCoords ? `${task.latitude.toFixed(6)}, ${task.longitude.toFixed(6)}` : '-',
        mapsUrl: hasTaskCoords ? `https://www.google.com/maps?q=${task.latitude},${task.longitude}` : null,
        jarak: Number.isFinite(jarakKm) ? `${jarakKm.toFixed(1)} km` : 'N/A'
      };
    });
  }, [tasks, trcCoords]);

  const ensureTrackingForValidation = () => {
    if (!isLiveTrackingOn || !trcCoords) {
      alert('Validasi hanya bisa dilakukan saat Live Tracking ON dan GPS aktif.');
      return false;
    }
    return true;
  };

  const handleSubmitValidation = async ({ taskId, status, skala, pesanSituasi, fotoFile }) => {
    if (!ensureTrackingForValidation()) return;

    setIsSubmittingValidation(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      if (status === 'hoax') {
        formData.append('status', 'Ditolak');
        formData.append('fase_penanganan', 'Laporan tidak valid (hoax)');
      } else {
        formData.append('status', 'Diproses');
        formData.append('fase_penanganan', `Validasi TRC (${skala})`);
      }

      if (pesanSituasi) {
        formData.append('pesan_situasi', pesanSituasi);
      }
      if (fotoFile) {
        formData.append('foto_progress', fotoFile);
      }

      const res = await fetch(`http://localhost:5000/api/laporan/update/${taskId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan validasi');
      }

      await fetchSemuaLaporan();
      alert('Validasi laporan berhasil dikirim.');
      setIsValidationModalOpen(false);
    } catch (error) {
      alert(error.message || 'Validasi gagal dikirim.');
    } finally {
      setIsSubmittingValidation(false);
    }
  };

  const handleSubmitProgress = async ({ taskId, fase, pesanSituasi, fotoFile }) => {
    setIsSubmittingProgress(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      const finalStatus = fase === 'selesai' ? 'Selesai' : 'Diproses';

      formData.append('status', finalStatus);
      formData.append('fase_penanganan', fase);
      if (pesanSituasi) {
        formData.append('pesan_situasi', pesanSituasi);
      }
      if (fotoFile) {
        formData.append('foto_progress', fotoFile);
      }

      const res = await fetch(`http://localhost:5000/api/laporan/update/${taskId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Gagal memperbarui progres');
      }

      await fetchSemuaLaporan();
      alert('Progres penanganan berhasil diperbarui.');
      setIsUpdateModalOpen(false);
    } catch (error) {
      alert(error.message || 'Gagal memperbarui progres.');
    } finally {
      setIsSubmittingProgress(false);
    }
  };

  // Filter tugas berdasarkan tab yang aktif
  const filteredTasks = tasksWithDistance.filter((t) => {
    if (activeTab === 'baru') return t.status === 'menunggu';
    if (activeTab === 'aktif') return t.status === 'penanganan';
    return t.status === 'ditolak';
  });
  
  // Hitung jumlah notifikasi di tab
  const countBaru = tasksWithDistance.filter(t => t.status === 'menunggu').length;
  const countAktif = tasksWithDistance.filter(t => t.status === 'penanganan').length;
  const countDitolak = tasksWithDistance.filter(t => t.status === 'ditolak').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <TRCNavbar />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Operasi Lapangan</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isLiveTrackingOn ? 'text-emerald-600 bg-emerald-100' : 'text-slate-500 bg-slate-200'}`}>
                <Radio size={12} className={isLiveTrackingOn ? 'animate-pulse' : ''} />
                {isLiveTrackingOn ? 'Live Tracking Aktif' : 'Live Tracking Nonaktif'}
              </span>
              <p className="text-slate-500 text-sm">
                {trcCoords
                  ? `Lokasi Anda: ${trcCoords.latitude.toFixed(5)}, ${trcCoords.longitude.toFixed(5)} (±${trackingAccuracy || '-'}m)`
                  : 'Lokasi Anda: belum terdeteksi'}
              </p>
            </div>
            {trackingUpdatedAt && (
              <p className="text-[11px] text-slate-400 mt-1">
                Update terakhir: {trackingUpdatedAt.toLocaleTimeString('id-ID')}
              </p>
            )}
            {trackingError && <p className="text-xs text-red-600 mt-1">{trackingError}</p>}
          </div>

          <button
            type="button"
            onClick={() => setIsLiveTrackingOn((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isLiveTrackingOn ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
          >
            {isLiveTrackingOn ? 'Matikan Live Tracking' : 'Nyalakan Live Tracking'}
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="flex border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('baru')} 
            className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'baru' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Laporan Baru (Validasi)
            {countBaru > 0 && <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{countBaru}</span>}
            {activeTab === 'baru' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('aktif')} 
            className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'aktif' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tugas Aktif (Penanganan)
            {countAktif > 0 && <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px]">{countAktif}</span>}
            {activeTab === 'aktif' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('ditolak')} 
            className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'ditolak' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Laporan Ditolak
            {countDitolak > 0 && <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{countDitolak}</span>}
            {activeTab === 'ditolak' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
          </button>
        </div>

        {/* Konten Daftar Laporan */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
             <Loader2 size={32} className="animate-spin text-red-600 mb-2" />
             <p>Mengambil data dari pusat komando...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-xl shadow-sm">
             <p className="text-slate-500">Tidak ada tugas di kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                data={task} 
                onValidate={(t) => {
                  if (!ensureTrackingForValidation()) return;
                  setSelectedTask(t);
                  setIsValidationModalOpen(true);
                }}
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
        onClose={() => setIsValidationModalOpen(false)}
        task={selectedTask}
        onSubmit={handleSubmitValidation}
        isSubmitting={isSubmittingValidation}
      />
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
        onOpenValidation={(t) => {
          if (!ensureTrackingForValidation()) return;
          setIsDetailModalOpen(false);
          setSelectedTask(t);
          setIsValidationModalOpen(true);
        }}
        onOpenUpdate={(t) => {
          setIsDetailModalOpen(false);
          setSelectedTask(t);
          setIsUpdateModalOpen(true);
        }}
      />
      <UpdateProgressModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        task={selectedTask}
        onSubmit={handleSubmitProgress}
        isSubmitting={isSubmittingProgress}
      />
      
    </div>
  );
}