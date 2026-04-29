'use client';

// src/components/masyarakat/RiwayatLaporan.jsx
// Daftar riwayat laporan milik masyarakat yang sedang login.

import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { getRiwayatMasyarakat } from '@/services/reportService';
import { formatWaktu, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';

export default function RiwayatLaporan() {
  const { data: riwayat, loading, error, refetch } = useAsync(getRiwayatMasyarakat);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-700">Riwayat Laporan Anda</h3>
        <button className="text-sm text-red-600 font-medium hover:underline">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3">
        {loading && <LoadingState />}

        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && riwayat?.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="Belum Ada Laporan"
            description="Anda belum pernah membuat laporan. Tekan tombol merah di atas untuk mulai melapor."
          />
        )}

        {!loading && !error && riwayat?.map((laporan) => (
          <div
            key={laporan.id_laporan}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-500 shrink-0">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors truncate">
                  {laporan.kategori_bencana}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Clock size={12} />
                  <span>{formatWaktu(laporan.waktu_laporan)}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${getStatusBadgeClass(laporan.status)}`}>
                  {getStatusLabel(laporan.status)}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400 group-hover:text-red-600 shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </section>
  );
}