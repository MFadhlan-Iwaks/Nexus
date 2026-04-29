// src/lib/utils.js
// ============================================================
// Utility functions yang dipakai di seluruh proyek NEXUS
// ============================================================

/**
 * Format timestamp ISO ke waktu lokal Indonesia.
 * @param {string} isoString
 * @returns {string} e.g. "29 Apr 2026, 10:30 WIB"
 */
export function formatWaktu(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return (
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(date) + ' WIB'
    );
  } catch {
    return '-';
  }
}

/**
 * Format timestamp ke waktu relatif (e.g. "5 mnt lalu").
 */
export function formatWaktuRelatif(isoString) {
  if (!isoString) return '';
  try {
    const selisih = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (selisih < 60) return 'Baru saja';
    if (selisih < 3600) return `${Math.floor(selisih / 60)} mnt lalu`;
    if (selisih < 86400) return `${Math.floor(selisih / 3600)} jam lalu`;
    return `${Math.floor(selisih / 86400)} hari lalu`;
  } catch {
    return '';
  }
}

// ─── STATUS LAPORAN ──────────────────────────────────────────

const STATUS_BADGE = {
  menunggu_admin: 'bg-amber-50 text-amber-700 border border-amber-200',
  diproses:       'bg-blue-50 text-blue-700 border border-blue-200',
  selesai:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ditolak:        'bg-red-50 text-red-700 border border-red-200',
  // alias masyarakat (kapital)
  Menunggu: 'bg-amber-50 text-amber-700 border border-amber-200',
  Diproses: 'bg-blue-50 text-blue-700 border border-blue-200',
  Selesai:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Ditolak:  'bg-red-50 text-red-700 border border-red-200',
};

export function getStatusBadgeClass(status) {
  return STATUS_BADGE[status] || 'bg-slate-50 text-slate-700 border border-slate-200';
}

const STATUS_LABEL = {
  menunggu_admin: 'Menunggu Admin',
  diproses:       'Sedang Ditangani',
  selesai:        'Selesai',
  ditolak:        'Ditolak',
  Menunggu: 'Menunggu Validasi TRC',
  Diproses: 'Sedang Ditangani',
  Selesai:  'Selesai',
  Ditolak:  'Ditolak',
};

export function getStatusLabel(status) {
  return STATUS_LABEL[status] || (status ?? '-');
}

// ─── LEVEL PERINGATAN ────────────────────────────────────────

export function getLevelBadgeClass(level) {
  const map = {
    rendah: 'bg-blue-50 text-blue-700 border border-blue-200',
    sedang: 'bg-amber-50 text-amber-700 border border-amber-200',
    tinggi: 'bg-red-50 text-red-700 border border-red-200',
  };
  return map[level] || 'bg-slate-50 text-slate-700';
}

export function getSkalaClass(skala) {
  const map = {
    rendah: 'text-emerald-700',
    sedang: 'text-amber-700',
    tinggi: 'text-red-700',
  };
  return map[skala] || 'text-slate-700';
}

// ─── STATUS LOGISTIK (Aman | Menipis | Habis) ────────────────

/**
 * CSS class badge untuk status logistik.
 * @param {'Aman'|'Menipis'|'Habis'} status
 */
export function getLogisticStatusClass(status) {
  const map = {
    Aman:    'bg-emerald-100 text-emerald-700',
    Menipis: 'bg-amber-100 text-amber-700',
    Habis:   'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

/** @deprecated gunakan getLogisticStatusClass */
export const getStockStatusClass = getLogisticStatusClass;

// ─── STATUS FASKES (Tersedia | Hampir Penuh | Penuh) ─────────

/**
 * CSS class badge untuk status fasilitas kesehatan.
 * BERBEDA dari logistik — faskes punya semantik kapasitas.
 * @param {'Tersedia'|'Hampir Penuh'|'Penuh'} status
 */
export function getFaskesStatusClass(status) {
  const map = {
    Tersedia:    'bg-emerald-100 text-emerald-700',
    'Hampir Penuh': 'bg-amber-100 text-amber-700',
    Penuh:       'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

/**
 * Label badge untuk summary faskes (huruf kecil dari store → tampilkan human-readable).
 * @param {string} status
 */
export function getFaskesStatusLabel(status) {
  const map = {
    tersedia:      'Tersedia',
    'hampir penuh': 'Hampir Penuh',
    penuh:         'Penuh',
    // langsung pass-through jika sudah kapital
    Tersedia:      'Tersedia',
    'Hampir Penuh': 'Hampir Penuh',
    Penuh:         'Penuh',
  };
  return map[status] || (status ?? '-');
}

// ─── TEKS SINGKAT ─────────────────────────────────────────────

export function truncate(text, max = 80) {
  if (!text) return '';
  return String(text).length > max ? String(text).slice(0, max) + '...' : String(text);
}
