// src/components/common/PageStates.jsx
// ============================================================
// Reusable: Loading, Error, Empty state components
// Dipakai di semua halaman untuk konsistensi UX
// ============================================================

import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

/**
 * Loading state — tampilan spinner saat data sedang dimuat.
 */
export function LoadingState({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={36} className="animate-spin mb-3 text-blue-500" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/**
 * Error state — tampilan saat terjadi kesalahan.
 */
export function ErrorState({ message = 'Terjadi kesalahan.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-red-50 border border-red-100 rounded-full p-4 mb-3">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <p className="text-sm font-bold text-slate-700 mb-1">Gagal Memuat Data</p>
      <p className="text-xs text-slate-500 mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} /> Coba Lagi
        </button>
      )}
    </div>
  );
}

/**
 * Empty state — tampilan saat tidak ada data.
 */
export function EmptyState({ title = 'Tidak Ada Data', description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-slate-100 rounded-full p-4 mb-3">
        <Icon size={32} className="text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-700 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-500 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
