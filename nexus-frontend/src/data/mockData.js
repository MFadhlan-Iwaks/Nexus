// src/data/mockData.js
// ============================================================
// NEXUS — Sumber Data Terpusat (Mock)
// ============================================================
// Semua data dummy ada di sini. Saat backend siap, cukup ganti
// isi service layer (src/services/) tanpa ubah komponen UI.
// ============================================================

// --- REPORTS ---
export const mockReports = [
  {
    id: 'RPT-101',
    status: 'menunggu_admin',
    masyarakat: {
      nama: 'M. Fadhlan',
      contact: '0812-1234-567',
      kategori: 'Banjir',
      deskripsi: 'Debit air naik cepat setelah hujan deras. Beberapa rumah tergenang sampai lutut, arus cukup deras di bantaran sungai.',
      latitude: -7.332301,
      longitude: 108.21415,
      foto: '/uploads/1776855656575.jpeg',
      waktu_lapor: '2026-04-29T07:15:00Z',
    },
    trc: {
      petugas: 'Budi Santoso',
      id: 'TRC-001',
      status_validasi: 'valid',
      skala_kedaruratan: 'tinggi',
      fase_penanganan: 'Evakuasi',
      catatan: 'Evakuasi warga terdampak sedang berlangsung.',
      foto_bukti: '/uploads/1776838126714.jpeg',
      waktu_validasi: '2026-04-29T07:32:00Z',
    },
  },
  {
    id: 'RPT-102',
    status: 'diproses',
    masyarakat: {
      nama: 'Doni Pratama',
      contact: '0812-9876-543',
      kategori: 'Longsor',
      deskripsi: 'Longsor kecil menutup akses jalan desa; tidak ada korban jiwa dilaporkan namun akses terganggu.',
      latitude: -7.35,
      longitude: 108.2,
      foto: '/uploads/1776786831141.png',
      waktu_lapor: '2026-04-29T06:30:00Z',
    },
    trc: {
      petugas: 'Budi Santoso',
      id: 'TRC-001',
      status_validasi: 'valid',
      skala_kedaruratan: 'sedang',
      fase_penanganan: 'Pembersihan Debris',
      catatan: 'Alat berat sedang dalam perjalanan.',
      foto_bukti: '/uploads/1776786440030.png',
      waktu_validasi: '2026-04-29T06:45:00Z',
    },
  },
  {
    id: 'RPT-103',
    status: 'selesai',
    masyarakat: {
      nama: 'Siti Nurhaliza',
      contact: '0856-1111-222',
      kategori: 'Pohon Tumbang',
      deskripsi: 'Pohon besar tumbang menimpa pagar rumah warga, tidak ada korban.',
      latitude: -7.32789,
      longitude: 108.22156,
      foto: '/uploads/1776855656575.jpeg',
      waktu_lapor: '2026-04-28T20:50:00Z',
    },
    trc: {
      petugas: 'Doni Pratama',
      id: 'TRC-003',
      status_validasi: 'valid',
      skala_kedaruratan: 'rendah',
      fase_penanganan: 'Selesai',
      catatan: 'Pohon berhasil dipindahkan, area bersih.',
      foto_bukti: '/uploads/1776838126714.jpeg',
      waktu_validasi: '2026-04-28T21:10:00Z',
    },
  },
  {
    id: 'RPT-104',
    status: 'selesai',
    masyarakat: {
      nama: 'Budi Santoso',
      contact: '0812-5555-666',
      kategori: 'Banjir',
      deskripsi: 'Genangan di wilayah pasar sudah mulai surut pagi ini.',
      latitude: -7.314,
      longitude: 108.233,
      foto: '/uploads/1776786440030.png',
      waktu_lapor: '2026-04-28T18:45:00Z',
    },
    trc: {
      petugas: 'Agus Hermawan',
      id: 'TRC-002',
      status_validasi: 'valid',
      skala_kedaruratan: 'sedang',
      fase_penanganan: 'Selesai',
      catatan: 'Genangan surut total, kondisi aman.',
      foto_bukti: '/uploads/1776855656575.jpeg',
      waktu_validasi: '2026-04-28T19:05:00Z',
    },
  },
  {
    id: 'RPT-105',
    status: 'menunggu_admin',
    masyarakat: {
      nama: 'Agus Kartono',
      contact: '0812-7777-888',
      kategori: 'Kebakaran',
      deskripsi: 'Kebakaran rumah kontrakan meluas ke rumah sebelah. Api tinggi menjalar cepat.',
      latitude: -7.321,
      longitude: 108.227,
      foto: '/uploads/1776855656575.jpeg',
      waktu_lapor: '2026-04-29T07:50:00Z',
    },
    trc: {
      petugas: 'Agus Hermawan',
      id: 'TRC-002',
      status_validasi: 'valid',
      skala_kedaruratan: 'tinggi',
      fase_penanganan: 'Pemadaman',
      catatan: 'Tim damkar telah tiba di lokasi.',
      foto_bukti: '/uploads/1776838126714.jpeg',
      waktu_validasi: '2026-04-29T08:05:00Z',
    },
  },
];

// --- RIWAYAT LAPORAN MASYARAKAT (view dari sisi masyarakat) ---
export const mockRiwayatMasyarakat = [
  {
    id_laporan: 'RPT-101',
    kategori_bencana: 'Banjir',
    deskripsi: 'Debit air naik cepat setelah hujan deras.',
    waktu_laporan: '2026-04-29T07:15:00Z',
    status: 'Diproses',
    koordinat: '-7.3323, 108.2141',
  },
  {
    id_laporan: 'RPT-098',
    kategori_bencana: 'Pohon Tumbang',
    deskripsi: 'Pohon besar tumbang di dekat sekolah.',
    waktu_laporan: '2026-04-27T14:00:00Z',
    status: 'Selesai',
    koordinat: '-7.3279, 108.2215',
  },
  {
    id_laporan: 'RPT-091',
    kategori_bencana: 'Banjir',
    deskripsi: 'Genangan setinggi mata kaki di halaman rumah.',
    waktu_laporan: '2026-04-20T09:30:00Z',
    status: 'Ditolak',
    koordinat: '-7.3300, 108.2200',
  },
];

// --- BROADCASTS / PERINGATAN DINI ---
export const mockBroadcasts = [
  {
    id: 'bc-1',
    pesan_peringatan: 'Waspada banjir susulan di bantaran sungai. Siapkan evakuasi mandiri dan jauhi area dataran rendah.',
    level: 'tinggi',
    target: 'Kecamatan: Cipedes',
    pengirim: 'Kepala BPBD',
    waktu_kirim: '2026-04-29T08:30:00Z',
  },
  {
    id: 'bc-2',
    pesan_peringatan: 'Hujan lebat diprediksi pukul 15.00–21.00, pantau informasi resmi BPBD dan hindari aktivitas di luar rumah.',
    level: 'sedang',
    target: 'Nasional: Indonesia',
    pengirim: 'Admin Piket',
    waktu_kirim: '2026-04-29T07:10:00Z',
  },
  {
    id: 'bc-3',
    pesan_peringatan: 'Situasi banjir di Kec. Tawang mulai terkendali. Tetap pantau perkembangan dari pihak berwenang.',
    level: 'rendah',
    target: 'Kota/Kabupaten: Tasikmalaya',
    pengirim: 'Admin Piket',
    waktu_kirim: '2026-04-28T20:00:00Z',
  },
];

// --- LOGISTICS ---
export const mockLogistics = [
  { id: 'log-1', nama: 'Beras untuk Dapur RS', kategori: 'Logistik Pangan', stok: 350, unit: 'Kg', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T09:12:00Z' },
  { id: 'log-2', nama: 'Air Mineral Pasien', kategori: 'Logistik Pangan', stok: 90, unit: 'Dus', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T09:08:00Z' },
  { id: 'log-3', nama: 'Selimut Ruang Isolasi', kategori: 'Sandang & Selimut', stok: 22, unit: 'Pcs', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T08:55:00Z' },
  { id: 'log-4', nama: 'Kantong Darah O+', kategori: 'Medis', stok: 0, unit: 'Kantong', institusi: 'PMI Tasikmalaya', terakhir_update: '2026-04-29T08:40:00Z' },
  { id: 'log-5', nama: 'Masker N95', kategori: 'Medis', stok: 15, unit: 'Box', institusi: 'Puskesmas Kawalu', terakhir_update: '2026-04-29T08:30:00Z' },
];

// --- FASKES (Fasilitas Kesehatan) ---
export const mockFaskes = [
  { id: 'fsk-1', nama: 'RSUD dr. Soekardjo (IGD)', kategori: 'Ruang Darurat (IGD)', stok: 5, unit: 'Bed', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T09:05:00Z' },
  { id: 'fsk-2', nama: 'RSUD dr. Soekardjo (Rawat Inap Lt.2)', kategori: 'Kamar Rawat Inap', stok: 14, unit: 'Bed', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T09:05:00Z' },
  { id: 'fsk-3', nama: 'RSUD dr. Soekardjo (Bank Darah)', kategori: 'Stok Kantong Darah', stok: 8, unit: 'Kantong', institusi: 'RSUD dr. Soekardjo', terakhir_update: '2026-04-29T09:05:00Z' },
  { id: 'fsk-4', nama: 'Puskesmas Cihideung (IGD)', kategori: 'Ruang Darurat (IGD)', stok: 3, unit: 'Bed', institusi: 'Puskesmas Cihideung', terakhir_update: '2026-04-29T08:58:00Z' },
  { id: 'fsk-5', nama: 'PMI Tasikmalaya (Donor Darah)', kategori: 'Stok Kantong Darah', stok: 0, unit: 'Kantong', institusi: 'PMI Tasikmalaya', terakhir_update: '2026-04-29T08:40:00Z' },
];

// --- USERS ---
export const mockUsers = [
  { id: 'USR-201', nama: 'M. Fadhlan', no_hp: '0812-1234-567', role: 'masyarakat', wilayah: 'Kec. Tawang', aktif: true, created_at: '2026-01-10' },
  { id: 'USR-202', nama: 'Siti Nurhaliza', no_hp: '0856-1111-222', role: 'masyarakat', wilayah: 'Kec. Cipedes', aktif: false, created_at: '2026-02-05' },
  { id: 'USR-203', nama: 'Budi Santoso', no_hp: '0811-2233-445', role: 'trc', wilayah: 'TRC Alfa', aktif: true, created_at: '2026-01-01' },
  { id: 'USR-204', nama: 'Agus Hermawan', no_hp: '0821-5678-901', role: 'trc', wilayah: 'TRC Bravo', aktif: true, created_at: '2026-01-01' },
  { id: 'USR-205', nama: 'Doni Pratama', no_hp: '0813-9999-000', role: 'trc', wilayah: 'TRC Charlie', aktif: false, created_at: '2026-01-01' },
  { id: 'USR-206', nama: 'Angga Nugraha', no_hp: '0856-3344-556', role: 'operator', wilayah: 'RSUD dr. Soekardjo', aktif: true, created_at: '2026-01-15' },
  { id: 'USR-207', nama: 'Risa Amelia', no_hp: '0819-7788-990', role: 'operator', wilayah: 'PMI Tasikmalaya', aktif: true, created_at: '2026-01-20' },
  { id: 'USR-001', nama: 'Kepala BPBD', no_hp: '0811-0000-001', role: 'admin', wilayah: 'BPBD Kota', aktif: true, created_at: '2025-12-01' },
];

// --- TRC UNITS ---
export const mockTrcUnits = [
  {
    id: 'TRC-001',
    nama: 'Budi Santoso',
    status: 'aktif',
    laporan_aktif_id: 'RPT-102',
    fase: 'Pembersihan Debris',
    progres_terakhir: 'Alat berat tiba di lokasi, pembersihan dimulai.',
    lokasi_terakhir: 'Desa Sukamaju, Blok C',
    waktu_update: '2026-04-29T09:00:00Z',
  },
  {
    id: 'TRC-002',
    nama: 'Agus Hermawan',
    status: 'aktif',
    laporan_aktif_id: 'RPT-105',
    fase: 'Pemadaman',
    progres_terakhir: 'Tim damkar berhasil padamkan 70% titik api.',
    lokasi_terakhir: 'Jl. Rumah Kontrakan No. 5',
    waktu_update: '2026-04-29T08:45:00Z',
  },
  {
    id: 'TRC-003',
    nama: 'Doni Pratama',
    status: 'tidak aktif',
    laporan_aktif_id: null,
    fase: null,
    progres_terakhir: 'Tugas terakhir selesai, standby di posko.',
    lokasi_terakhir: 'Posko BPBD',
    waktu_update: '2026-04-28T21:10:00Z',
  },
];

// --- STOCK HISTORY (Operator) ---
export const mockStockHistory = [
  {
    id: 'hist-1',
    waktu: '2026-04-29T10:45:00Z',
    operator: 'Angga Nugraha',
    nama_item: 'Beras Premium',
    aksi: 'update',
    tipe: 'logistik',
    stok_sebelum: 3000,
    stok_sesudah: 2500,
    unit: 'Kg',
    status: 'Sukses',
  },
  {
    id: 'hist-2',
    waktu: '2026-04-29T09:30:00Z',
    operator: 'Risa Amelia',
    nama_item: 'Kantong Darah O+',
    aksi: 'update',
    tipe: 'logistik',
    stok_sebelum: 20,
    stok_sesudah: 0,
    unit: 'Kantong',
    status: 'Sukses',
  },
  {
    id: 'hist-3',
    waktu: '2026-04-29T08:00:00Z',
    operator: 'Angga Nugraha',
    nama_item: 'Masker N95',
    aksi: 'add',
    tipe: 'logistik',
    stok_sebelum: null,
    stok_sesudah: 15,
    unit: 'Box',
    status: 'Sukses',
  },
];

// --- LOGISTIC SUMMARY (untuk Admin Dashboard) ---
export const mockLogisticSummary = [
  { id: 'lg-1', institution: 'RSUD dr. Soekardjo', totalItems: 12, availableStock: 462, status: 'Aman', updatedAt: '09:12 WIB' },
  { id: 'lg-2', institution: 'PMI Tasikmalaya', totalItems: 8, availableStock: 95, status: 'Menipis', updatedAt: '09:08 WIB' },
  { id: 'lg-3', institution: 'Puskesmas Kawalu', totalItems: 6, availableStock: 0, status: 'Habis', updatedAt: '08:55 WIB' },
];

// --- FASKES SUMMARY (untuk Admin Dashboard) ---
export const mockFaskesSummary = [
  { id: 'fs-1', institution: 'RSUD dr. Soekardjo', totalUnits: 4, availableCapacity: 23, status: 'Tersedia', updatedAt: '09:05 WIB' },
  { id: 'fs-2', institution: 'Puskesmas Cihideung', totalUnits: 3, availableCapacity: 4, status: 'Hampir Penuh', updatedAt: '08:58 WIB' },
  { id: 'fs-3', institution: 'PMI Tasikmalaya', totalUnits: 2, availableCapacity: 0, status: 'Penuh', updatedAt: '08:40 WIB' },
];

// --- MAP POINTS (untuk Admin Peta) ---
export const mockLogisticPoints = [
  { id: 'LP-1', label: 'Gudang Logistik RSUD', status: 'aman', coordinates: [-7.336, 108.219], stock: 350 },
  { id: 'LP-2', label: 'Posko PMI Timur', status: 'menipis', coordinates: [-7.329, 108.236], stock: 95 },
  { id: 'LP-3', label: 'Gudang Puskesmas Kawalu', status: 'habis', coordinates: [-7.351, 108.209], stock: 0 },
];

export const mockFaskesPoints = [
  { id: 'FP-1', label: 'IGD RSUD dr. Soekardjo', status: 'aman', coordinates: [-7.331, 108.226], capacity: 14 },
  { id: 'FP-2', label: 'Puskesmas Cihideung', status: 'menipis', coordinates: [-7.323, 108.217], capacity: 8 },
  { id: 'FP-3', label: 'PMI Tasikmalaya', status: 'habis', coordinates: [-7.318, 108.235], capacity: 0 },
];

// --- NOTIFICATIONS ---
export const mockAdminNotifications = [
  { id: 'adm-1', title: 'Laporan Baru Masuk', message: '3 laporan bencana baru menunggu validasi TRC.', time: '2 menit lalu', read: false },
  { id: 'adm-2', title: 'Update Faskes', message: 'RSUD Kota memperbarui kapasitas ruang darurat.', time: '12 menit lalu', read: false },
  { id: 'adm-3', title: 'Broadcast Terkirim', message: 'Notifikasi peringatan dini berhasil dipancarkan.', time: '30 menit lalu', read: true },
];

export const mockMasyarakatNotifications = [
  { id: 'm-1', title: 'Peringatan Cuaca', message: 'Curah hujan tinggi diperkirakan terjadi sore ini di wilayah Anda.', time: '5 menit lalu', read: false },
  { id: 'm-2', title: 'Laporan Diterima', message: 'Laporan Anda (RPT-101) sedang menunggu validasi tim TRC.', time: '20 menit lalu', read: true },
];

export const mockTrcNotifications = [
  { id: 't-1', title: 'Laporan Baru', message: 'Laporan banjir baru masuk dari wilayah Anda (REP-001).', time: '10 menit lalu', read: false },
  { id: 't-2', title: 'Update Tugas', message: 'Tugas REP-003 diperbarui oleh Admin.', time: '1 jam lalu', read: true },
];

// --- PROFIL DEFAULT (sementara sebelum ada auth context) ---
export const mockAdminProfile = {
  nama: 'Kepala BPBD',
  role: 'Administrator',
  id: 'ADM-001',
  no_hp: '0811-0000-001',
  email: 'admin.bpbd@nexus.id',
  alamat: 'Kantor BPBD Kota',
  instansi: 'BPBD Kota',
};

export const mockMasyarakatProfile = {
  nama: 'M. Fadhlan',
  role: 'Masyarakat',
  id: 'USR-201',
  no_hp: '0812-3456-7890',
  email: 'fadhlan@nexus.id',
  alamat: 'Kec. Tawang, Tasikmalaya',
  instansi: 'Warga',
};

export const mockTrcProfile = {
  nama: 'Budi Santoso',
  role: 'TRC',
  id: 'TRC-001',
  no_hp: '0811-2233-445',
  email: 'trc001@nexus.id',
  alamat: 'Posko TRC Alfa',
  instansi: 'TRC BPBD',
  lokasi: 'Kec. Tawang',
  unit: 'Tim Alfa',
};

export const mockOperatorProfile = {
  nama: 'Angga Nugraha',
  role: 'Operator',
  id: 'USR-206',
  no_hp: '0856-3344-556',
  email: 'operator@nexus.id',
  alamat: 'RSUD dr. Soekardjo',
  instansi: 'RSUD dr. Soekardjo',
};
