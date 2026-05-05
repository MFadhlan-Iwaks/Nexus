'use client';

import { AlertTriangle, BellRing, Info } from 'lucide-react';
import { getBroadcasts } from '@/services/broadcastService';
import { useAsync } from '@/hooks/useAsync';
import { formatWaktuRelatif, getLevelBadgeClass } from '@/lib/utils';
import LinkifiedText from '@/components/common/LinkifiedText';

function getLevelIcon(level) {
  if (level === 'tinggi') return <AlertTriangle size={18} className="text-red-500" />;
  if (level === 'sedang') return <AlertTriangle size={18} className="text-amber-500" />;
  return <Info size={18} className="text-blue-500" />;
}

function getLevelFrame(level) {
  if (level === 'tinggi') return 'border-red-200 bg-red-50';
  if (level === 'sedang') return 'border-amber-200 bg-amber-50';
  return 'border-blue-200 bg-blue-50';
}

export default function BroadcastNotice({
  title = 'Peringatan Admin Terbaru',
  description = 'Informasi resmi dari admin BPBD untuk koordinasi lintas aktor.',
  maxItems = 3,
}) {
  const { data: broadcasts, loading, error, refetch } = useAsync(getBroadcasts);
  const items = (broadcasts || []).slice(0, maxItems);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <BellRing size={16} className="text-slate-500" /> {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        {error && (
          <button
            type="button"
            onClick={refetch}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 shrink-0"
          >
            Refresh
          </button>
        )}
      </div>

      {loading && (
        <div className="text-xs text-slate-400 border border-slate-100 rounded-xl p-3">
          Memuat peringatan admin...
        </div>
      )}

      {!loading && error && (
        <div className="text-xs text-red-600 border border-red-100 bg-red-50 rounded-xl p-3">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-xs text-slate-400 border border-slate-100 rounded-xl p-3">
          Belum ada broadcast aktif dari admin.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className={`border rounded-xl p-3 ${getLevelFrame(item.level)}`}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white rounded-full shadow-sm shrink-0">
                  {getLevelIcon(item.level)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getLevelBadgeClass(item.level)}`}>
                      {item.level}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatWaktuRelatif(item.waktu_kirim)}</span>
                  </div>
                  <LinkifiedText text={item.pesan_peringatan} className="text-sm font-semibold text-slate-800 leading-relaxed" />
                  <p className="text-xs text-slate-500 mt-1">Target: {item.target}</p>
                  {item.nama_zona && (
                    <p className="text-xs text-blue-700 mt-1">
                      Zona: {item.nama_zona}
                      {item.radius_meter ? ` (${(Number(item.radius_meter) / 1000).toFixed(1)} km)` : ''}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
