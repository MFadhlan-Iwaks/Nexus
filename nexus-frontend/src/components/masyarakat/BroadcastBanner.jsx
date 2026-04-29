'use client';

// src/components/masyarakat/BroadcastBanner.jsx
// Menampilkan peringatan dini terbaru dari Admin/BPBD.

import { AlertTriangle, BellRing, Info } from 'lucide-react';
import { getBroadcasts } from '@/services/broadcastService';
import { formatWaktuRelatif, getLevelBadgeClass } from '@/lib/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';

export default function BroadcastBanner() {
  const { data: broadcasts, loading, error, refetch } = useAsync(getBroadcasts);

  const getLevelIcon = (level) => {
    if (level === 'tinggi') return <AlertTriangle size={20} className="text-red-500" />;
    if (level === 'sedang') return <AlertTriangle size={20} className="text-amber-500" />;
    return <Info size={20} className="text-blue-500" />;
  };

  const getLevelBg = (level) => {
    if (level === 'tinggi') return 'bg-red-50 border-red-200';
    if (level === 'sedang') return 'bg-amber-50 border-amber-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-1">
        <BellRing size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-700">Peringatan Dini Terbaru</h3>
      </div>

      <div className="space-y-3">
        {loading && <LoadingState message="Memeriksa pembaruan sistem..." />}

        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && broadcasts?.length === 0 && (
          <EmptyState
            icon={Info}
            title="Tidak Ada Peringatan"
            description="Tidak ada peringatan dini saat ini. Kondisi aman."
          />
        )}

        {!loading && !error && broadcasts?.map((item) => (
          <div
            key={item.id}
            className={`border rounded-xl p-4 flex items-start gap-4 shadow-sm transition-all hover:shadow-md ${getLevelBg(item.level)}`}
          >
            <div className="p-2 bg-white rounded-full shadow-sm shrink-0 mt-0.5">
              {getLevelIcon(item.level)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getLevelBadgeClass(item.level)}`}>
                  {item.level} — INFO DARURAT
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {formatWaktuRelatif(item.waktu_kirim)}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {item.pesan_peringatan}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Target: {item.target} — Pengirim: {item.pengirim}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}