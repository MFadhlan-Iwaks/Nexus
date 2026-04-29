'use client';

// src/app/admin/dashboard/page.js — Refactored: pakai service layer & mockData terpusat

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldAlert, Megaphone, Activity, LogOut, LayoutDashboard, Users, Boxes, Send, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatusInstansi from '@/components/Admin/StatusInstansi';
import ManajemenPengguna from '@/components/Admin/ManajemenPengguna';
import ReportDetailModal from '@/components/Admin/ReportDetailModal';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationBell from '@/components/common/NotificationBell';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';
import { getReports } from '@/services/reportService';
import { getBroadcasts, createBroadcast } from '@/services/broadcastService';
import { getUsers, updateUserRole, toggleUserStatus } from '@/services/userService';
import { getDashboardStats, getLogisticSummary, getFaskesSummary } from '@/services/dashboardService';
import {
  mockAdminProfile, mockAdminNotifications,
  mockLogisticPoints, mockFaskesPoints,
} from '@/data/mockData';
import { formatWaktuRelatif, getStatusBadgeClass, getStatusLabel, getSkalaClass, getLevelBadgeClass, getLogisticStatusClass } from '@/lib/utils';

const MapWithNoSSR = dynamic(() => import('@/components/Admin/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-2xl border border-slate-200">
      <div className="flex flex-col items-center text-slate-400">
        <Activity size={32} className="animate-bounce mb-2" />
        <p className="font-semibold text-sm">Memuat Sistem Spasial BPBD...</p>
      </div>
    </div>
  ),
});

const mapPresets = {
  tasikmalaya: { label: 'Tasikmalaya', center: [-7.3274, 108.2207], zoom: 12, radius: 12000 },
  kota: { label: 'Kota Tasikmalaya', center: [-7.3274, 108.2207], zoom: 13, radius: 8000 },
  kecamatan: { label: 'Kecamatan/Desa', center: [-7.3274, 108.2207], zoom: 14, radius: 3000 },
  jawa_barat: { label: 'Jawa Barat', center: [-6.9, 107.6], zoom: 8, radius: 90000 },
  custom: { label: 'Kustom Admin', center: [-7.3274, 108.2207], zoom: 12, radius: 0 },
};

export default function AdminExecutiveDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mapScope, setMapScope] = useState('tasikmalaya');
  const [monitoringCircle, setMonitoringCircle] = useState(mapPresets.tasikmalaya);
  const [selectedReport, setSelectedReport] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({
    pesan_peringatan: '', level: 'sedang', target_scope: 'nasional', target_nama: 'Indonesia',
  });

  // --- Data via services ---
  const { data: reports, loading: loadingReports, error: errorReports, refetch: refetchReports } = useAsync(getReports);
  const { data: users, loading: loadingUsers } = useAsync(getUsers);
  const { data: stats, loading: loadingStats } = useAsync(getDashboardStats);
  const { data: logisticSummary } = useAsync(getLogisticSummary);
  const { data: faskesSummary } = useAsync(getFaskesSummary);

  // Local state untuk broadcast history & users (optimistic updates)
  const [broadcastHistory, setBroadcastHistory] = useState(null);
  const { loading: loadingBc } = useAsync(async () => {
    const data = await getBroadcasts();
    setBroadcastHistory(data);
  }, []);

  const [localUsers, setLocalUsers] = useState(null);

  const activeReports = useMemo(() => reports || [], [reports]);

  const mapReports = useMemo(() =>
    activeReports.map((r) => ({
      id: r.id,
      coordinates: [r.masyarakat?.latitude, r.masyarakat?.longitude],
      category: r.masyarakat?.kategori,
      status: r.status,
      emergencyScale: r.trc?.skala_kedaruratan || 'sedang',
      phase: r.trc?.fase_penanganan || '-',
    })), [activeReports]);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    setLocalUsers((prev) =>
      (prev || users || []).map((u) => u.id === id ? { ...u, role } : u)
    );
  };

  const handleToggleUser = async (id) => {
    await toggleUserStatus(id);
    setLocalUsers((prev) =>
      (prev || users || []).map((u) => u.id === id ? { ...u, aktif: !(u.aktif ?? u.active ?? true) } : u)
    );
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.pesan_peringatan.trim()) return;
    try {
      const { broadcast } = await createBroadcast({ ...broadcastForm, pengirim: mockAdminProfile.nama });
      setBroadcastHistory((prev) => [broadcast, ...(prev || [])]);
      setBroadcastForm((prev) => ({ ...prev, pesan_peringatan: '' }));
    } catch (err) {
      alert(`Gagal mengirim broadcast: ${err.message}`);
    }
  };

  const prepareBroadcastFromReport = (report) => {
    setBroadcastForm((p) => ({
      ...p,
      level: report.trc?.skala_kedaruratan || 'sedang',
      target_scope: 'kecamatan',
      target_nama: `Koordinat ${report.masyarakat?.latitude?.toFixed(4) ?? '-'}, ${report.masyarakat?.longitude?.toFixed(4) ?? '-'}`,
      pesan_peringatan: `Laporan ${report.masyarakat?.kategori ?? 'bencana'} dari ${report.masyarakat?.nama ?? 'warga'}: ${report.masyarakat?.deskripsi || ''}. Tim TRC telah memvalidasi.`,
    }));
    setActiveTab('broadcast');
  };

  const handleMapPresetChange = (scope) => {
    setMapScope(scope);
    if (scope === 'custom') {
      setMonitoringCircle((prev) => ({ ...prev, label: 'Kustom Admin' }));
      return;
    }
    setMonitoringCircle(mapPresets[scope]);
  };

  const handleCircleCenterChange = (center) => {
    setMapScope('custom');
    setMonitoringCircle((prev) => ({ ...prev, center }));
  };

  const handleCircleRadiusChange = (value) => {
    const radiusKm = Math.max(0, Number(value) || 0);
    setMapScope('custom');
    setMonitoringCircle((prev) => ({ ...prev, radius: radiusKm * 1000 }));
  };

  const handleCircleLabelChange = (value) => {
    setMapScope('custom');
    setMonitoringCircle((prev) => ({ ...prev, label: value || 'Kustom Admin' }));
  };

  const resetCircleToTasikmalaya = () => {
    setMapScope('tasikmalaya');
    setMonitoringCircle(mapPresets.tasikmalaya);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'broadcast', icon: Megaphone, label: 'Broadcast' },
    { id: 'pengguna', icon: Users, label: 'Pengguna' },
    { id: 'sumberdaya', icon: Boxes, label: 'Sumber Daya' },
  ];

  const getMenuClass = (tabId) =>
    `w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl font-medium justify-center lg:justify-start transition-all ${
      activeTab === tabId
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const headerTitles = {
    dashboard: 'Dashboard Statistik & Peta',
    broadcast: 'Broadcast Peringatan Dini',
    pengguna: 'Manajemen Pengguna',
    sumberdaya: 'Monitoring Sumber Daya',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 flex flex-col h-screen transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <ShieldAlert size={24} className="text-red-500" />
          <span className="text-white font-bold text-xl ml-3 tracking-wide hidden lg:block">
            NEXUS <span className="text-slate-500 text-xs font-normal">COMMAND</span>
          </span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {menuItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={getMenuClass(id)}>
              <Icon size={20} />
              <span className="hidden lg:block">{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors justify-center lg:justify-start"
          >
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <h1 className="font-bold text-lg text-slate-800 hidden sm:block">
            {headerTitles[activeTab] || 'Executive Dashboard'} — Pusat Komando BPBD
          </h1>
          <h1 className="font-bold text-lg text-slate-800 sm:hidden">Pusat Komando</h1>
          <div className="flex items-center gap-4">
            <NotificationBell items={mockAdminNotifications} />
            <div className="h-8 w-px bg-slate-200" />
            <UserProfileDropdown
              defaultProfile={mockAdminProfile}
              roleClassName="text-green-600"
              avatarClassName="bg-slate-800 text-white"
            />
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-hidden bg-slate-50 flex flex-col lg:flex-row gap-6">

          {/* ===== DASHBOARD TAB ===== */}
          {activeTab === 'dashboard' && (
            <div className="w-full h-full overflow-auto animate-in fade-in">
              {loadingStats ? <LoadingState /> : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Laporan', value: stats?.totalLaporan, color: 'slate' },
                      { label: 'Tervalidasi & Diproses', value: (stats?.menunggu || 0) + (stats?.diproses || 0), color: 'blue' },
                      { label: 'Ditolak / Hoax', value: stats?.ditolak, color: 'red' },
                      { label: 'Selesai', value: stats?.selesai, color: 'emerald' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`bg-white rounded-xl border border-${color}-200 p-4`}>
                        <p className={`text-xs text-${color}-${color === 'slate' ? '500' : '700'}`}>{label}</p>
                        <p className={`text-2xl font-bold text-${color}-${color === 'slate' ? '800' : '700'} mt-1`}>{value ?? '-'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[420px]">
                      <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-white z-10">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                          <Activity size={18} className="text-blue-600" /> Pemantauan Spasial Live
                        </h2>
                        <select
                          value={mapScope}
                          onChange={(e) => handleMapPresetChange(e.target.value)}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white"
                        >
                          {Object.entries(mapPresets).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 relative p-2 min-h-[360px]">
                        <MapWithNoSSR
                          disasterReports={mapReports}
                          logisticPoints={mockLogisticPoints}
                          faskesPoints={mockFaskesPoints}
                          mapCenter={monitoringCircle.center}
                          mapZoom={monitoringCircle.zoom}
                          mapRadius={monitoringCircle.radius}
                          circleLabel={monitoringCircle.label}
                          isCircleEditable
                          onCircleCenterChange={handleCircleCenterChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-4">
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Megaphone size={18} /> Peringatan Dini</h3>
                        <p className="text-xs text-red-700 mb-4 leading-relaxed">Broadcast ke masyarakat berbasis wilayah dan level peringatan.</p>
                        <button onClick={() => setActiveTab('broadcast')} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                          <Megaphone size={16} /> Buka Broadcast
                        </button>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-5">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm">Legenda Marker</h3>
                        <div className="space-y-2 text-xs text-slate-700">
                          <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />Laporan Bencana</p>
                          <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />Logistik Operator</p>
                          <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />Faskes Operator</p>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:col-span-2 2xl:col-span-1">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm">Lingkaran Pemantauan</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <label className="font-bold text-slate-700 col-span-2">
                            Nama Lingkaran
                            <input
                              value={monitoringCircle.label}
                              onChange={(e) => handleCircleLabelChange(e.target.value)}
                              className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-normal"
                              placeholder="Contoh: Zona Evakuasi Cipedes"
                            />
                          </label>
                          <label className="font-bold text-slate-700">
                            Latitude
                            <input
                              type="number"
                              step="0.0001"
                              value={monitoringCircle.center[0]}
                              onChange={(e) => handleCircleCenterChange([Number(e.target.value), monitoringCircle.center[1]])}
                              className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-normal"
                            />
                          </label>
                          <label className="font-bold text-slate-700">
                            Longitude
                            <input
                              type="number"
                              step="0.0001"
                              value={monitoringCircle.center[1]}
                              onChange={(e) => handleCircleCenterChange([monitoringCircle.center[0], Number(e.target.value)])}
                              className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-normal"
                            />
                          </label>
                          <label className="font-bold text-slate-700 col-span-2">
                            Radius Pemantauan (km)
                            <input
                              type="number"
                              min="0"
                              max="200"
                              value={Math.round(monitoringCircle.radius / 1000)}
                              onChange={(e) => handleCircleRadiusChange(e.target.value)}
                              className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-normal"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Pilih Kustom Admin, geser/zoom peta, lalu klik area mana pun untuk membuat pusat lingkaran.</p>
                        <button
                          onClick={resetCircleToTasikmalaya}
                          className="mt-3 w-full border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold py-2 rounded-lg text-xs"
                        >
                          Reset ke Tasikmalaya
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Laporan Aktif */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                      <h3 className="font-bold text-slate-800 mb-3">Laporan Aktif Tervalidasi TRC</h3>
                      {loadingReports ? <LoadingState /> : errorReports ? <ErrorState message={errorReports} onRetry={refetchReports} /> : (
                        <div className="space-y-2 text-sm">
                          {activeReports.filter((r) => r.status === 'menunggu_admin' || r.status === 'diproses').map((r) => (
                            <div key={r.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{r.id} — {r.masyarakat?.kategori}</p>
                                <p className="text-xs text-slate-500">Pelapor: {r.masyarakat?.nama} • Validator: {r.trc?.petugas}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Skala: <span className={`font-bold ${getSkalaClass(r.trc?.skala_kedaruratan)}`}>{r.trc?.skala_kedaruratan}</span>
                                  <span className="mx-1.5">|</span>
                                  Fase TRC: <span className="font-bold text-slate-700">{r.trc?.fase_penanganan || '-'}</span>
                                </p>
                                {r.trc?.catatan && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Catatan: {r.trc.catatan}</p>
                                )}
                                {r.trc?.waktu_update && (
                                  <p className="text-[11px] text-slate-400 mt-1">Update TRC: {formatWaktuRelatif(r.trc.waktu_update)}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setSelectedReport(r)}
                                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"
                                >
                                  <Eye size={14} /> Detail
                                </button>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusBadgeClass(r.status)}`}>
                                  {getStatusLabel(r.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {activeReports.filter((r) => r.status === 'menunggu_admin' || r.status === 'diproses').length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">Tidak ada laporan aktif.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sinkronisasi Instansi */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                      <h3 className="font-bold text-slate-800 mb-3">Sinkronisasi Instansi (Operator)</h3>
                      <div className="space-y-2 text-sm">
                        {(logisticSummary || []).map((item) => {
                          const st = item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : '-';
                          return (
                            <div key={item.id || item.institution} className="border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{item.institution ?? '-'}</p>
                                <p className="text-xs text-slate-500">{item.totalItems ?? '-'} item • stok {item.availableStock ?? '-'}</p>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${getLogisticStatusClass(st)}`}>
                                {st}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== BROADCAST TAB ===== */}
          {activeTab === 'broadcast' && (
            <div className="w-full h-full overflow-auto grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-bold text-slate-800 text-lg mb-1">Broadcast Peringatan Dini</h2>
                <p className="text-xs text-slate-500 mb-5">Terhubung ke dashboard masyarakat, TRC, dan operator.</p>
                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Pesan</label>
                    <textarea
                      value={broadcastForm.pesan_peringatan}
                      onChange={(e) => setBroadcastForm((p) => ({ ...p, pesan_peringatan: e.target.value }))}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      rows={5} placeholder="Tulis pesan peringatan resmi..." required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Level Peringatan</label>
                      <select value={broadcastForm.level} onChange={(e) => setBroadcastForm((p) => ({ ...p, level: e.target.value }))} className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm">
                        <option value="rendah">Rendah</option>
                        <option value="sedang">Sedang</option>
                        <option value="tinggi">Tinggi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Target Wilayah</label>
                      <select value={broadcastForm.target_scope} onChange={(e) => setBroadcastForm((p) => ({ ...p, target_scope: e.target.value }))} className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm">
                        {['nasional', 'provinsi', 'kota', 'kecamatan', 'desa', 'kustom'].map((v) => (
                          <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Detail Target</label>
                    <input
                      value={broadcastForm.target_nama}
                      onChange={(e) => setBroadcastForm((p) => ({ ...p, target_nama: e.target.value }))}
                      className="w-full mt-1 border border-slate-300 rounded-xl p-2.5 text-sm"
                      placeholder="Contoh: Indonesia, Jawa Barat, Kota Bandung"
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Send size={16} /> Kirim Broadcast
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-800 mb-3">Riwayat Broadcast</h3>
                {loadingBc ? <LoadingState /> : (
                  <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                    {(broadcastHistory || []).map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getLevelBadgeClass(item.level)}`}>{item.level}</span>
                          <span className="text-xs text-slate-500">{item.waktu_kirim ? new Date(item.waktu_kirim).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'}</span>
                        </div>
                        <p className="text-sm text-slate-800 font-medium">{item.pesan_peringatan}</p>
                        <p className="text-xs text-slate-500 mt-1">Target: {item.target} — Pengirim: {item.pengirim}</p>
                      </div>
                    ))}
                    {!broadcastHistory?.length && <p className="text-sm text-slate-400 text-center py-4">Belum ada riwayat broadcast.</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== PENGGUNA TAB ===== */}
          {activeTab === 'pengguna' && (
            <div className="w-full h-full">
              {loadingUsers ? <LoadingState /> : (
                <ManajemenPengguna
                  users={localUsers || users || []}
                  onRoleChange={handleRoleChange}
                  onToggleUser={handleToggleUser}
                />
              )}
            </div>
          )}

          {/* ===== SUMBERDAYA TAB ===== */}
          {activeTab === 'sumberdaya' && (
            <div className="w-full h-full">
              <StatusInstansi
                logisticSummary={logisticSummary || []}
                faskesSummary={faskesSummary || []}
              />
            </div>
          )}

        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <ReportDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onCreateBroadcast={(report) => {
              prepareBroadcastFromReport(report);
              setSelectedReport(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
