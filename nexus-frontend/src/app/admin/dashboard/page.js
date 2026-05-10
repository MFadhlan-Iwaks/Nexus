'use client';



import { useMemo, useState, useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { ShieldAlert, Megaphone, Activity, LogOut, LayoutDashboard, Users, Boxes, Send, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatusInstansi from '@/components/Admin/StatusInstansi';
import ManajemenPengguna from '@/components/Admin/ManajemenPengguna';
import ConfirmDeleteUserModal from '@/components/Admin/ConfirmDeleteUserModal';
import ReportDetailModal from '@/components/Admin/ReportDetailModal';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationBell from '@/components/common/NotificationBell';
import { LoadingState, ErrorState } from '@/components/common/PageStates';
import LinkifiedText from '@/components/common/LinkifiedText';
import { useAsync } from '@/hooks/useAsync';
import { getReports } from '@/services/reportService';
import { getBroadcasts, createBroadcast, deleteBroadcast } from '@/services/broadcastService';
import { getUsers, updateUserRole, deleteUser } from '@/services/userService';
import { getDashboardStats, getLogisticSummary, getFaskesSummary } from '@/services/dashboardService';
import { getLogistics } from '@/services/logisticService';
import { getFacilities } from '@/services/facilityService';
import { getTrcLocations } from '@/services/trcService';
import { mockAdminProfile, mockAdminNotifications, staticEvacuationPoints } from '@/data/mockData';
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

const scalePriority = { tinggi: 3, sedang: 2, rendah: 1 };

const healthFacilityTypeLabels = {
  rumah_sakit: 'Rumah Sakit',
  puskesmas: 'Puskesmas',
  klinik: 'Klinik',
};

const reportHazardRadiusByScale = {
  tinggi: 1500,
  sedang: 900,
  rendah: 500,
};

function normalizeHealthFacilityType(item) {
  const text = [
    item?.tipe,
    item?.jenis,
    item?.kategori,
    item?.nama_fasilitas,
    item?.nama,
    item?.label,
  ].filter(Boolean).join(' ').toLowerCase();

  if (text.includes('puskesmas')) return 'puskesmas';
  if (text.includes('klinik')) return 'klinik';
  return 'rumah_sakit';
}

function getGoogleMapsLink(latitude, longitude) {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function removeEvacuationMessageBlock(message) {
  return String(message || '').split('\n\nTitik evakuasi aman:')[0].trim();
}

function buildEvacuationMessageBlock(points) {
  if (!points.length) return '';
  const list = points.map((point, index) => (
    `${index + 1}. ${point.nama} (${point.wilayah})\n${getGoogleMapsLink(point.latitude, point.longitude)}`
  )).join('\n\n');

  return `Titik evakuasi aman:\n${list}\n\nKoordinat dapat dibuka melalui tautan Google Maps.`;
}

function getSafeEvacuationPointsForArea(points, hazardArea) {
  const activePoints = points.filter((point) => point.status === 'aktif');
  if (!hazardArea?.center) return activePoints;

  return activePoints
    .map((point) => {
      const distance = getDistanceMeters(hazardArea.center, [point.latitude, point.longitude]);
      return { ...point, distance };
    })
    .filter((point) => point.distance > (hazardArea.radius || 0))
    .sort((a, b) => a.distance - b.distance);
}

function isEvacuationPointSafe(point, hazardArea) {
  if (!hazardArea?.center) return true;
  const distance = getDistanceMeters(hazardArea.center, [point.latitude, point.longitude]);
  return distance > (hazardArea.radius || 0);
}

const broadcastTemplates = [
  {
    id: 'banjir',
    label: 'Banjir',
    level: 'tinggi',
    message: 'Peringatan dini banjir. Warga di area rawan diminta menjauhi aliran sungai, mematikan listrik bila air mulai naik, dan mengikuti arahan petugas.',
  },
  {
    id: 'longsor',
    label: 'Longsor',
    level: 'tinggi',
    message: 'Peringatan dini tanah longsor. Warga di lereng dan area rawan diminta menjauh dari tebing, menghindari jalur tertutup material, dan menuju titik aman.',
  },
  {
    id: 'kebakaran',
    label: 'Kebakaran',
    level: 'tinggi',
    message: 'Peringatan kebakaran. Warga diminta menjauh dari lokasi, membuka akses bagi petugas, dan tidak mendekati area berasap atau berpotensi ledakan.',
  },
  {
    id: 'evakuasi',
    label: 'Evakuasi',
    level: 'sedang',
    message: 'Imbauan evakuasi. Warga di zona terdampak diminta segera menuju titik kumpul terdekat dan membawa dokumen penting serta kebutuhan dasar.',
  },
  {
    id: 'logistik',
    label: 'Logistik',
    level: 'sedang',
    message: 'Informasi bantuan logistik. Distribusi bantuan darurat sedang disiapkan. Warga diminta menunggu arahan petugas di posko resmi.',
  },
];

function isValidCoordinate(coordinates) {
  return Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite);
}

function getDistanceMeters(from, to) {
  if (!isValidCoordinate(from) || !isValidCoordinate(to)) return Infinity;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function subscribeUserSession(onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getUserSessionSnapshot() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user');
}

function getServerUserSessionSnapshot() {
  return null;
}

export default function AdminExecutiveDashboard() {
  const router = useRouter();
  const userSession = useSyncExternalStore(
    subscribeUserSession,
    getUserSessionSnapshot,
    getServerUserSessionSnapshot
  );
  const user = useMemo(() => {
    if (!userSession) return null;
    try {
      return JSON.parse(userSession);
    } catch {
      return null;
    }
  }, [userSession]);
  const hasUser = Boolean(user);
  const role = String(user?.role || '').toLowerCase();

  useEffect(() => {
    if (!hasUser) {
      document.cookie = 'role=; Max-Age=0; path=/; samesite=lax';
      document.cookie = 'token=; Max-Age=0; path=/; samesite=lax';
      router.replace('/auth');
      return;
    }
    if (role !== 'admin') {
      const target = role === 'operator'
        ? '/operator/dashboard'
        : role === 'trc'
          ? '/trc/dashboard'
          : role === 'masyarakat'
          ? '/masyarakat/dashboard'
            : '/auth';
      router.replace(target);
    }
  }, [hasUser, role, router]);

  if (!hasUser || role !== 'admin') {
    return <LoadingState message="Mengalihkan..." />;
  }

  return <AdminExecutiveDashboardContent currentUser={user} />;
}

function AdminExecutiveDashboardContent({ currentUser }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mapScope, setMapScope] = useState('tasikmalaya');
  const [monitoringCircle, setMonitoringCircle] = useState(mapPresets.tasikmalaya);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportScaleFilter, setReportScaleFilter] = useState('semua');
  const [reportStatusFilter, setReportStatusFilter] = useState('semua');
  const [reportSortMode, setReportSortMode] = useState('prioritas');
  const [broadcastForm, setBroadcastForm] = useState({
    pesan_peringatan: '',
    level: 'sedang',
    target_scope: 'nasional',
    target_nama: 'Indonesia',
    nama_zona: null,
    radius_meter: null,
    zona_bahaya: null,
  });
  const [broadcastHazardArea, setBroadcastHazardArea] = useState(null);
  const [selectedEvacuationPointIds, setSelectedEvacuationPointIds] = useState([]);
  const [customEvacuationPoints, setCustomEvacuationPoints] = useState([]);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [customEvacuationForm, setCustomEvacuationForm] = useState({
    nama: '',
    wilayah: '',
    latitude: '',
    longitude: '',
    kapasitas: '',
  });


  const { data: reports, loading: loadingReports, error: errorReports, refetch: refetchReports } = useAsync(getReports);
  const { data: users, loading: loadingUsers, error: errorUsers, refetch: refetchUsers } = useAsync(getUsers);
  const { data: stats, loading: loadingStats, error: errorStats, refetch: refetchStats } = useAsync(getDashboardStats);
  const { data: logisticSummary, error: errorLogisticSummary, refetch: refetchLogisticSummary } = useAsync(getLogisticSummary);
  const { data: faskesSummary, error: errorFaskesSummary, refetch: refetchFaskesSummary } = useAsync(getFaskesSummary);
  const { data: logistics } = useAsync(getLogistics);
  const { data: facilities } = useAsync(getFacilities);
  const { data: trcLocations } = useAsync(getTrcLocations);


  const [broadcastHistory, setBroadcastHistory] = useState(null);
  const { loading: loadingBc, error: errorBc, refetch: refetchBc } = useAsync(async () => {
    const data = await getBroadcasts();
    setBroadcastHistory(data);
  }, []);

  const [localUsers, setLocalUsers] = useState(null);

  const activeReports = useMemo(() => reports || [], [reports]);
  const activeReportList = useMemo(() => (
    activeReports
      .filter((r) => r.status === 'menunggu_admin' || r.status === 'diproses')
      .filter((r) => reportScaleFilter === 'semua' || r.trc?.skala_kedaruratan === reportScaleFilter)
      .filter((r) => reportStatusFilter === 'semua' || r.status === reportStatusFilter)
      .slice()
      .sort((a, b) => {
        const aTime = a?.masyarakat?.waktu_lapor ? new Date(a.masyarakat.waktu_lapor).getTime() : 0;
        const bTime = b?.masyarakat?.waktu_lapor ? new Date(b.masyarakat.waktu_lapor).getTime() : 0;
        const priorityDiff = (scalePriority[b.trc?.skala_kedaruratan] || 0) - (scalePriority[a.trc?.skala_kedaruratan] || 0);

        if (reportSortMode === 'terbaru') return bTime - aTime;
        if (reportSortMode === 'terlama') return aTime - bTime;
        if (reportSortMode === 'skala') return priorityDiff || bTime - aTime;
        if (reportSortMode === 'fase') {
          const aUpdate = a?.trc?.waktu_update ? new Date(a.trc.waktu_update).getTime() : aTime;
          const bUpdate = b?.trc?.waktu_update ? new Date(b.trc.waktu_update).getTime() : bTime;
          return bUpdate - aUpdate;
        }

        return priorityDiff || bTime - aTime;
      })
  ), [activeReports, reportScaleFilter, reportSortMode, reportStatusFilter]);

  const formatSequenceId = (index) => String(index + 1).padStart(3, '0');

  const mapReports = useMemo(() =>
    activeReports.map((r) => ({
      id: r.id,
      coordinates: [r.masyarakat?.latitude, r.masyarakat?.longitude],
      category: r.masyarakat?.kategori,
      status: r.status,
      emergencyScale: r.trc?.skala_kedaruratan || 'sedang',
      phase: r.trc?.fase_penanganan || '-',
    })), [activeReports]);

  const mapFaskes = useMemo(() =>
    (facilities || []).map((item) => {
      const facilityType = normalizeHealthFacilityType(item);
      return {
        id: item.id,
        label: item.nama_fasilitas || item.nama,
        facilityType,
        facilityTypeLabel: healthFacilityTypeLabels[facilityType],
        wilayah: item.wilayah || item.lokasi || item.institusi || healthFacilityTypeLabels[facilityType],
        coordinates: [item.latitude, item.longitude],
        capacity: item.kapasitas_tersedia ?? item.stok,
        status: item.kapasitas_tersedia !== undefined ? (item.kapasitas_tersedia <= 0 ? 'penuh' : item.kapasitas_tersedia <= 5 ? 'hampir penuh' : 'tersedia') : 'tersedia',
      };
    }), [facilities]);

  const trcPoints = useMemo(() =>
    (trcLocations || []).map((location) => ({
      id: location.id,
      name: location.nama,
      status: location.status,
      coordinates: [location.latitude, location.longitude],
    })), [trcLocations]);

  const zoneReports = useMemo(() => {
    if (monitoringCircle.radius <= 0) return [];
    return activeReportList
      .map((report) => {
        const coordinates = [report.masyarakat?.latitude, report.masyarakat?.longitude];
        return {
          ...report,
          distance: getDistanceMeters(monitoringCircle.center, coordinates),
        };
      })
      .filter((report) => report.distance <= monitoringCircle.radius)
      .sort((a, b) => {
        const priorityDiff = (scalePriority[b.trc?.skala_kedaruratan] || 0) - (scalePriority[a.trc?.skala_kedaruratan] || 0);
        return priorityDiff || a.distance - b.distance;
      });
  }, [activeReportList, monitoringCircle.center, monitoringCircle.radius]);

  const zoneReportIds = useMemo(() => new Set(zoneReports.map((report) => report.id)), [zoneReports]);

  const zoneFaskes = useMemo(() => {
    if (monitoringCircle.radius <= 0) return [];
    return mapFaskes
      .map((item) => ({ ...item, distance: getDistanceMeters(monitoringCircle.center, item.coordinates) }))
      .filter((item) => item.distance <= monitoringCircle.radius)
      .sort((a, b) => a.distance - b.distance);
  }, [mapFaskes, monitoringCircle.center, monitoringCircle.radius]);

  const evacuationPointTemplates = useMemo(() => {
    const healthFacilityTemplates = mapFaskes
      .filter((item) => isValidCoordinate(item.coordinates))
      .map((item) => ({
        id: `faskes-evac-${item.id}`,
        nama: item.label,
        tipe: 'fasilitas_layanan_kesehatan',
        wilayah: item.wilayah,
        latitude: item.coordinates[0],
        longitude: item.coordinates[1],
        kapasitas: item.capacity ?? '-',
        status: 'aktif',
        sourceLabel: item.facilityTypeLabel,
      }));

    return [
      ...staticEvacuationPoints,
      ...healthFacilityTemplates,
    ];
  }, [mapFaskes]);

  const safeEvacuationPoints = useMemo(() => {
    return getSafeEvacuationPointsForArea(evacuationPointTemplates, broadcastHazardArea);
  }, [broadcastHazardArea, evacuationPointTemplates]);

  const selectedEvacuationPoints = useMemo(() => {
    const selectedIds = new Set(selectedEvacuationPointIds);
    return [
      ...safeEvacuationPoints.filter((point) => selectedIds.has(point.id)),
      ...customEvacuationPoints,
    ];
  }, [customEvacuationPoints, safeEvacuationPoints, selectedEvacuationPointIds]);

  const setBroadcastMessageWithEvacuationPoints = (message, points) => {
    const baseMessage = removeEvacuationMessageBlock(message);
    const evacuationBlock = buildEvacuationMessageBlock(points);
    return evacuationBlock ? `${baseMessage}\n\n${evacuationBlock}` : baseMessage;
  };

  const handleEvacuationPointToggle = (pointId) => {
    const nextIds = selectedEvacuationPointIds.includes(pointId)
      ? selectedEvacuationPointIds.filter((id) => id !== pointId)
      : [...selectedEvacuationPointIds, pointId];
    const nextSelectedPoints = [
      ...safeEvacuationPoints.filter((point) => nextIds.includes(point.id)),
      ...customEvacuationPoints,
    ];

    setSelectedEvacuationPointIds(nextIds);
    setBroadcastForm((prev) => ({
      ...prev,
      pesan_peringatan: setBroadcastMessageWithEvacuationPoints(prev.pesan_peringatan, nextSelectedPoints),
    }));
  };

  const handleAddCustomEvacuationPoint = () => {
    const latitude = Number(customEvacuationForm.latitude);
    const longitude = Number(customEvacuationForm.longitude);
    const nama = customEvacuationForm.nama.trim();

    if (!nama || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      alert('Nama, latitude, dan longitude titik evakuasi wajib diisi dengan benar.');
      return;
    }

    const point = {
      id: `custom-evac-${Date.now()}`,
      nama,
      wilayah: customEvacuationForm.wilayah.trim() || 'Titik ditentukan admin',
      latitude,
      longitude,
      kapasitas: customEvacuationForm.kapasitas.trim() || '-',
      status: 'aktif',
    };

    if (!isEvacuationPointSafe(point, broadcastHazardArea)) {
      alert('Titik evakuasi ini berada dalam radius terdampak. Pilih lokasi lain yang lebih aman.');
      return;
    }

    const nextCustomPoints = [...customEvacuationPoints, point];
    const nextSelectedPoints = [
      ...safeEvacuationPoints.filter((item) => selectedEvacuationPointIds.includes(item.id)),
      ...nextCustomPoints,
    ];

    setCustomEvacuationPoints(nextCustomPoints);
    setCustomEvacuationForm({ nama: '', wilayah: '', latitude: '', longitude: '', kapasitas: '' });
    setBroadcastForm((prev) => ({
      ...prev,
      pesan_peringatan: setBroadcastMessageWithEvacuationPoints(prev.pesan_peringatan, nextSelectedPoints),
    }));
  };

  const handleRemoveCustomEvacuationPoint = (pointId) => {
    const nextCustomPoints = customEvacuationPoints.filter((point) => point.id !== pointId);
    const nextSelectedPoints = [
      ...safeEvacuationPoints.filter((item) => selectedEvacuationPointIds.includes(item.id)),
      ...nextCustomPoints,
    ];

    setCustomEvacuationPoints(nextCustomPoints);
    setBroadcastForm((prev) => ({
      ...prev,
      pesan_peringatan: setBroadcastMessageWithEvacuationPoints(prev.pesan_peringatan, nextSelectedPoints),
    }));
  };

  const zoneLevel = useMemo(() => {
    const maxPriority = zoneReports.reduce((max, report) => Math.max(max, scalePriority[report.trc?.skala_kedaruratan] || 0), 0);
    if (maxPriority >= 3) return 'tinggi';
    if (maxPriority === 2) return 'sedang';
    return 'rendah';
  }, [zoneReports]);

  const zonePointWkt = useMemo(() => {
    const [lat, lng] = monitoringCircle.center;
    return Number.isFinite(lat) && Number.isFinite(lng) ? `POINT(${lng} ${lat})` : null;
  }, [monitoringCircle.center]);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    setLocalUsers((prev) =>
      (prev || users || []).map((u) => u.id === id ? { ...u, role } : u)
    );
  };

  const handleRequestDeleteUser = (user) => {
    setDeleteUserTarget(user);
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteUserTarget) return;

    setIsDeletingUser(true);
    try {
      await deleteUser(deleteUserTarget.id);
      setLocalUsers((prev) => (prev || users || []).filter((u) => u.id !== deleteUserTarget.id));
      setDeleteUserTarget(null);
    } catch (err) {
      alert(`Gagal menghapus user: ${err.message}`);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.pesan_peringatan.trim()) return;
    try {
      const sender = currentUser?.nama || mockAdminProfile.nama;
      const { broadcast } = await createBroadcast({ ...broadcastForm, pengirim: sender });
      setBroadcastHistory((prev) => [broadcast, ...(prev || [])]);
      setBroadcastForm((prev) => ({
        ...prev,
        pesan_peringatan: '',
        nama_zona: null,
        radius_meter: null,
        zona_bahaya: null,
      }));
      setBroadcastHazardArea(null);
      setSelectedEvacuationPointIds([]);
      setCustomEvacuationPoints([]);
      setCustomEvacuationForm({ nama: '', wilayah: '', latitude: '', longitude: '', kapasitas: '' });
    } catch (err) {
      alert(`Gagal mengirim broadcast: ${err.message}`);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    try {
      await deleteBroadcast(id);
      setBroadcastHistory((prev) => (prev || []).filter((item) => item.id !== id));
    } catch (err) {
      alert(`Gagal menghapus broadcast: ${err.message}`);
    }
  };

  const prepareBroadcastFromReport = (report) => {
    const coordinates = [report.masyarakat?.latitude, report.masyarakat?.longitude];
    const radius = reportHazardRadiusByScale[report.trc?.skala_kedaruratan] || reportHazardRadiusByScale.sedang;
    const hazardArea = isValidCoordinate(coordinates)
      ? { center: coordinates, radius, label: report.masyarakat?.kategori || 'Zona Laporan' }
      : null;
    const baseMessage = `Laporan ${report.masyarakat?.kategori ?? 'bencana'} dari ${report.masyarakat?.nama ?? 'warga'}: ${report.masyarakat?.deskripsi || ''}. Tim TRC telah memvalidasi.`;

    setBroadcastHazardArea(hazardArea);
    setSelectedEvacuationPointIds([]);
    setCustomEvacuationPoints([]);
    setCustomEvacuationForm({ nama: '', wilayah: '', latitude: '', longitude: '', kapasitas: '' });
    setBroadcastForm((p) => ({
      ...p,
      level: report.trc?.skala_kedaruratan || 'sedang',
      target_scope: 'kecamatan',
      target_nama: `Koordinat ${report.masyarakat?.latitude?.toFixed(4) ?? '-'}, ${report.masyarakat?.longitude?.toFixed(4) ?? '-'}`,
      pesan_peringatan: baseMessage,
      nama_zona: hazardArea?.label || null,
      radius_meter: hazardArea?.radius ?? null,
      zona_bahaya: hazardArea ? `POINT(${hazardArea.center[1]} ${hazardArea.center[0]})` : null,
    }));
    setActiveTab('broadcast');
  };

  const prepareBroadcastFromZone = () => {
    const radiusKm = monitoringCircle.radius / 1000;
    const reportSummary = zoneReports.length > 0
      ? `Terdapat ${zoneReports.length} laporan aktif tervalidasi di area ini.`
      : 'Belum ada laporan aktif tervalidasi di area ini.';
    const resourceSummary = `Fasilitas layanan kesehatan terpantau: ${zoneFaskes.length}.`;
    const hazardArea = {
      center: monitoringCircle.center,
      radius: monitoringCircle.radius,
      label: monitoringCircle.label,
    };
    const baseMessage = `Peringatan dini untuk ${monitoringCircle.label} radius ${radiusKm.toFixed(1)} km. ${reportSummary} ${resourceSummary} Warga diminta meningkatkan kewaspadaan dan mengikuti arahan petugas.`;

    setBroadcastHazardArea(hazardArea);
    setSelectedEvacuationPointIds([]);
    setCustomEvacuationPoints([]);
    setCustomEvacuationForm({ nama: '', wilayah: '', latitude: '', longitude: '', kapasitas: '' });
    setBroadcastForm((prev) => ({
      ...prev,
      level: zoneLevel,
      target_scope: 'kustom',
      target_nama: `${monitoringCircle.label} (${radiusKm.toFixed(1)} km)`,
      pesan_peringatan: baseMessage,
      nama_zona: monitoringCircle.label,
      radius_meter: Math.round(monitoringCircle.radius),
      zona_bahaya: zonePointWkt,
    }));
    setActiveTab('broadcast');
  };

  const applyBroadcastTemplate = (template) => {
    setBroadcastForm((prev) => ({
      ...prev,
      level: template.level,
      pesan_peringatan: setBroadcastMessageWithEvacuationPoints(prev.nama_zona
        ? `${template.message} Target zona: ${prev.nama_zona}.`
        : template.message, selectedEvacuationPoints),
    }));
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

      
      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
          <h1 className="font-bold text-lg text-slate-800 hidden sm:block">
            {headerTitles[activeTab] || 'Executive Dashboard'} — Pusat Komando BPBD
          </h1>
          <h1 className="font-bold text-lg text-slate-800 sm:hidden">Pusat Komando</h1>
          <div className="flex items-center gap-4">
            <NotificationBell items={mockAdminNotifications} />
            <div className="h-8 w-px bg-slate-200" />
            <UserProfileDropdown
              defaultProfile={currentUser || mockAdminProfile}
              roleClassName="text-green-600"
              avatarClassName="bg-slate-800 text-white"
            />
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-hidden bg-slate-50 flex flex-col lg:flex-row gap-6">

          
          {activeTab === 'dashboard' && (
            <div className="w-full h-full overflow-auto animate-in fade-in">
              {loadingStats ? <LoadingState /> : errorStats ? <ErrorState message={errorStats} onRetry={refetchStats} /> : (
                <>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Total Laporan', value: stats?.totalLaporan, color: 'slate' },
                      { label: 'Menunggu & Diproses', value: (stats?.menunggu || 0) + (stats?.diproses || 0), color: 'blue' },
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
                          faskesPoints={mapFaskes}
                          trcPoints={trcPoints}
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
                        <div className="space-y-3 text-xs text-slate-700">
                          <div>
                            <p className="font-semibold text-slate-500 mb-1">Laporan Bencana</p>
                            <div className="space-y-1">
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" />Menunggu Validasi</p>
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-2" />Diproses</p>
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />Selesai</p>
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />Ditolak / Hoax</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-500 mb-1">Fasilitas Layanan Kesehatan</p>
                            <div className="space-y-1">
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-600 mr-2" />Rumah Sakit</p>
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-600 mr-2" />Puskesmas</p>
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-600 mr-2" />Klinik</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-500 mb-1">TRC</p>
                            <div className="space-y-1">
                              <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 mr-2" />Lokasi TRC Aktif</p>
                            </div>
                          </div>
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
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <div className="grid grid-cols-2 gap-2 text-center">
                            {[
                              { label: 'Laporan', value: zoneReports.length },
                              { label: 'Fasilitas Layanan Kesehatan', value: zoneFaskes.length },
                            ].map((item) => (
                              <div key={item.label} className="rounded-lg bg-slate-50 border border-slate-100 px-2 py-2">
                                <p className="text-base font-bold text-slate-800">{item.value}</p>
                                <p className="text-[11px] leading-tight text-slate-500">{item.label}</p>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={prepareBroadcastFromZone}
                            disabled={monitoringCircle.radius <= 0}
                            className={`mt-3 w-full font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 ${
                              monitoringCircle.radius > 0
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Megaphone size={14} /> Broadcast
                          </button>

                          <div className="mt-4">
                            <h4 className="font-bold text-slate-700 text-xs mb-2">Laporan Dalam Zona</h4>
                            {monitoringCircle.radius <= 0 ? (
                              <p className="text-xs text-slate-400">Aktifkan radius untuk melihat laporan dalam zona.</p>
                            ) : zoneReports.length === 0 ? (
                              <p className="text-xs text-slate-400">Belum ada laporan aktif dalam zona ini.</p>
                            ) : (
                              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                                {zoneReports.slice(0, 5).map((report) => (
                                  <div key={report.id} className="border border-slate-100 rounded-lg p-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate">{report.masyarakat?.kategori || 'Laporan'} - {report.id}</p>
                                        <p className="text-[11px] text-slate-500">
                                          {report.trc?.skala_kedaruratan || '-'} | {(report.distance / 1000).toFixed(1)} km
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedReport(report)}
                                        className="text-[11px] font-bold text-blue-700 hover:text-blue-800"
                                      >
                                        Detail
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                      <div className="flex flex-col gap-3 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-slate-800">Laporan Aktif Tervalidasi TRC</h3>
                            <p className="text-xs text-slate-500">Filter laporan tanpa mengubah alur validasi TRC.</p>
                          </div>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg self-start sm:self-auto">
                            {activeReportList.length} laporan
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={reportScaleFilter}
                            onChange={(e) => setReportScaleFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                          >
                            <option value="semua">Semua Skala</option>
                            <option value="rendah">Rendah</option>
                            <option value="sedang">Sedang</option>
                            <option value="tinggi">Tinggi</option>
                          </select>
                          <select
                            value={reportStatusFilter}
                            onChange={(e) => setReportStatusFilter(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                          >
                            <option value="semua">Semua Status</option>
                            <option value="menunggu_admin">Tervalidasi TRC</option>
                            <option value="diproses">Sedang Ditangani</option>
                          </select>
                          <select
                            value={reportSortMode}
                            onChange={(e) => setReportSortMode(e.target.value)}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                          >
                            <option value="prioritas">Prioritas Tinggi</option>
                            <option value="terbaru">Terbaru</option>
                            <option value="terlama">Terlama</option>
                            <option value="skala">Skala Tertinggi</option>
                            <option value="fase">Update TRC Terbaru</option>
                          </select>
                        </div>
                      </div>
                      {loadingReports ? <LoadingState /> : errorReports ? <ErrorState message={errorReports} onRetry={refetchReports} /> : (
                        <div className="space-y-2 text-sm">
                          {activeReportList.map((r, index) => (
                            <div key={r.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-slate-800 truncate">{formatSequenceId(index)} — {r.masyarakat?.kategori}</p>
                                  {zoneReportIds.has(r.id) && (
                                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                      Dalam Zona Aktif
                                    </span>
                                  )}
                                  {r.trc?.skala_kedaruratan === 'tinggi' && (
                                    <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                                      Prioritas Tinggi
                                    </span>
                                  )}
                                </div>
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
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                                <button
                                  onClick={() => setSelectedReport({ ...r, displayId: formatSequenceId(index) })}
                                  className="px-3 py-1.5 text-xs font-bold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"
                                >
                                  <Eye size={14} /> Detail
                                </button>
                                <button
                                  onClick={() => prepareBroadcastFromReport(r)}
                                  className="px-3 py-1.5 text-xs font-bold border border-red-200 text-red-700 rounded-lg hover:bg-red-50 inline-flex items-center gap-1"
                                >
                                  <Megaphone size={14} /> Broadcast
                                </button>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusBadgeClass(r.status)}`}>
                                  {getStatusLabel(r.status)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {activeReportList.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4">Tidak ada laporan aktif.</p>
                          )}
                        </div>
                      )}
                    </div>

                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-5">
                      <h3 className="font-bold text-slate-800 mb-3">Sinkronisasi Instansi (Operator)</h3>
                      {errorLogisticSummary ? (
                        <ErrorState message={errorLogisticSummary} onRetry={refetchLogisticSummary} />
                      ) : (
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
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          
          {activeTab === 'broadcast' && (
            <div className="w-full h-full overflow-auto grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="font-bold text-slate-800 text-lg mb-1">Broadcast Peringatan Dini</h2>
                <p className="text-xs text-slate-500 mb-5">Terhubung ke dashboard masyarakat, TRC, dan operator.</p>
                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Template Cepat</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {broadcastTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyBroadcastTemplate(template)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  {broadcastForm.nama_zona && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                      <p className="font-bold">Zona Broadcast</p>
                      <p className="mt-1">Nama: {broadcastForm.nama_zona}</p>
                      <p>Radius: {((broadcastForm.radius_meter || 0) / 1000).toFixed(1)} km</p>
                      <p>Pusat: {broadcastForm.zona_bahaya || '-'}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Titik Evakuasi yang Dikirim</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Admin menentukan sendiri titik evakuasi. Koordinat akan masuk ke pesan sebagai link Google Maps.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextPoints = safeEvacuationPoints.slice(0, 3);
                          setSelectedEvacuationPointIds(nextPoints.map((point) => point.id));
                          setBroadcastForm((prev) => ({
                            ...prev,
                            pesan_peringatan: setBroadcastMessageWithEvacuationPoints(prev.pesan_peringatan, [
                              ...nextPoints,
                              ...customEvacuationPoints,
                            ]),
                          }));
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Bantu Pilih 3 Aman
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={customEvacuationForm.nama}
                        onChange={(e) => setCustomEvacuationForm((prev) => ({ ...prev, nama: e.target.value }))}
                        className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        placeholder="Nama titik, contoh: GOR Sukapura"
                      />
                      <input
                        value={customEvacuationForm.wilayah}
                        onChange={(e) => setCustomEvacuationForm((prev) => ({ ...prev, wilayah: e.target.value }))}
                        className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        placeholder="Wilayah, contoh: Kota Tasikmalaya"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={customEvacuationForm.latitude}
                        onChange={(e) => setCustomEvacuationForm((prev) => ({ ...prev, latitude: e.target.value }))}
                        className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        placeholder="Latitude"
                      />
                      <input
                        type="number"
                        step="0.000001"
                        value={customEvacuationForm.longitude}
                        onChange={(e) => setCustomEvacuationForm((prev) => ({ ...prev, longitude: e.target.value }))}
                        className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        placeholder="Longitude"
                      />
                      <input
                        value={customEvacuationForm.kapasitas}
                        onChange={(e) => setCustomEvacuationForm((prev) => ({ ...prev, kapasitas: e.target.value }))}
                        className="border border-slate-300 rounded-lg px-2.5 py-2 text-xs bg-white"
                        placeholder="Kapasitas, opsional"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomEvacuationPoint}
                        className="rounded-lg bg-slate-900 px-2.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Tambah Titik
                      </button>
                    </div>
                    {customEvacuationPoints.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {customEvacuationPoints.map((point) => (
                          <div key={point.id} className="flex items-start justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2 text-xs">
                            <div className="min-w-0 text-blue-900">
                              <p className="font-bold">{point.nama}</p>
                              <p>{point.wilayah} • Kapasitas {point.kapasitas}</p>
                              <p className="break-all text-blue-700">{getGoogleMapsLink(point.latitude, point.longitude)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomEvacuationPoint(point.id)}
                              className="shrink-0 font-bold text-red-600 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <p className="text-xs font-bold text-slate-700">Pilih dari titik aman tersimpan</p>
                      <p className="text-xs text-slate-500 mt-1">Termasuk RS, puskesmas, dan klinik dari dashboard. Daftar ini hanya menampilkan titik di luar radius terdampak.</p>
                    </div>
                    <div className="mt-3 space-y-2 max-h-48 overflow-auto pr-1">
                      {safeEvacuationPoints.map((point) => (
                        <label key={point.id} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedEvacuationPointIds.includes(point.id)}
                            onChange={() => handleEvacuationPointToggle(point.id)}
                            className="mt-0.5"
                          />
                          <span className="min-w-0">
                            <span className="block font-bold text-slate-800">{point.nama}</span>
                            <span className="block text-slate-500">
                              {point.sourceLabel ? `${point.sourceLabel} • ` : ''}{point.wilayah} • Kapasitas {point.kapasitas}
                              {Number.isFinite(point.distance) ? ` • ${(point.distance / 1000).toFixed(1)} km dari zona` : ''}
                            </span>
                            <span className="block text-blue-700 break-all">{getGoogleMapsLink(point.latitude, point.longitude)}</span>
                          </span>
                        </label>
                      ))}
                      {safeEvacuationPoints.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-3">Belum ada titik evakuasi aman di luar radius zona.</p>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Send size={16} /> Kirim Broadcast
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-800 mb-3">Riwayat Broadcast</h3>
                {loadingBc ? <LoadingState /> : errorBc ? <ErrorState message={errorBc} onRetry={refetchBc} /> : (
                  <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                    {(broadcastHistory || []).map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${getLevelBadgeClass(item.level)}`}>{item.level}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{item.waktu_kirim ? new Date(item.waktu_kirim).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-'}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBroadcast(item.id)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                        <LinkifiedText text={item.pesan_peringatan} className="text-sm text-slate-800 font-medium" />
                        <p className="text-xs text-slate-500 mt-1">Target: {item.target} — Pengirim: {item.pengirim}</p>
                        {item.nama_zona && (
                          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-900">
                            <p className="font-bold">Zona: {item.nama_zona}</p>
                            <p>Radius: {item.radius_meter ? `${(Number(item.radius_meter) / 1000).toFixed(1)} km` : '-'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {!broadcastHistory?.length && <p className="text-sm text-slate-400 text-center py-4">Belum ada riwayat broadcast.</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          
          {activeTab === 'pengguna' && (
            <div className="w-full h-full">
              {loadingUsers ? <LoadingState /> : errorUsers ? (
                <ErrorState message={errorUsers} onRetry={refetchUsers} />
              ) : (
                <ManajemenPengguna
                  users={localUsers || users || []}
                  onRoleChange={handleRoleChange}
                  onDeleteUser={handleRequestDeleteUser}
                />
              )}
            </div>
          )}

          
          {activeTab === 'sumberdaya' && (
            <div className="w-full h-full">
              {(errorLogisticSummary || errorFaskesSummary) ? (
                <ErrorState
                  message={errorLogisticSummary || errorFaskesSummary}
                  onRetry={() => {
                    refetchLogisticSummary();
                    refetchFaskesSummary();
                  }}
                />
              ) : (
                <StatusInstansi
                  logisticSummary={logisticSummary || []}
                  faskesSummary={faskesSummary || []}
                  logisticItems={logistics || []}
                  faskesItems={facilities || []}
                />
              )}
            </div>
          )}

        </div>

        
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
        <ConfirmDeleteUserModal
          isOpen={Boolean(deleteUserTarget)}
          user={deleteUserTarget}
          loading={isDeletingUser}
          onCancel={() => {
            if (!isDeletingUser) setDeleteUserTarget(null);
          }}
          onConfirm={handleConfirmDeleteUser}
        />
      </main>
    </div>
  );
}
