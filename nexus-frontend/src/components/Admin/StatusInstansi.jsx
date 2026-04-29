// src/components/Admin/StatusInstansi.jsx
// Monitoring sumber daya instansi (logistik + faskes)
// Faskes: Tersedia | Hampir Penuh | Penuh
// Logistik: Aman | Menipis | Habis

import { Building2, Package, Ambulance } from 'lucide-react';
import { getFaskesStatusClass, getLogisticStatusClass } from '@/lib/utils';

export default function StatusInstansi({ logisticSummary = [], faskesSummary = [] }) {
  // Logistik — status bisa 'aman'|'menipis'|'habis' (lower) atau 'Aman'|'Menipis'|'Habis' (kapital)
  const getLogisticStatusBadge = (rawStatus) => {
    const s = String(rawStatus || '');
    const normalized = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const labelMap = { Aman: 'Aman', Menipis: 'Menipis', Habis: 'Habis' };
    return { label: labelMap[normalized] || s, cls: getLogisticStatusClass(normalized) };
  };

  // Faskes — status bisa 'tersedia'|'hampir penuh'|'penuh' atau sudah kapital
  const getFaskesBadge = (rawStatus) => {
    const s = String(rawStatus || '');
    // Normalisasi huruf kapital awal tiap kata
    const normalized = s
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const validLabels = { Tersedia: 'Tersedia', 'Hampir Penuh': 'Hampir Penuh', Penuh: 'Penuh' };
    const label = validLabels[normalized] || s;
    return { label, cls: getFaskesStatusClass(label) };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 text-lg">Monitoring Sumber Daya Instansi</h2>
        <p className="text-xs text-slate-500">
          Ringkasan stok barang bantuan/medis dan kapasitas layanan medis dari operator dengan status terkini.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Logistik */}
        <div className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Package size={18} /></div>
            <h3 className="font-bold text-slate-800">Ringkasan Stok Logistik</h3>
          </div>

          {logisticSummary.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Menunggu data dari operator.</p>
          ) : (
            <div className="space-y-3">
              {logisticSummary.map((item) => {
                const { label, cls } = getLogisticStatusBadge(item.status);
                return (
                  <div key={item.id || item.institution} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.institution || '-'}</p>
                      <p className="text-xs text-slate-500">
                        {item.totalItems ?? '-'} item • stok {item.availableStock ?? '-'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Update: {item.updatedAt || '-'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full shrink-0 ${cls}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Faskes */}
        <div className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><Ambulance size={18} /></div>
            <h3 className="font-bold text-slate-800">Ringkasan Kapasitas Layanan Medis</h3>
          </div>

          {faskesSummary.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Menunggu data dari operator.</p>
          ) : (
            <div className="space-y-3">
              {faskesSummary.map((item) => {
                const { label, cls } = getFaskesBadge(item.status);
                return (
                  <div key={item.id || item.institution} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{item.institution || '-'}</p>
                      <p className="text-xs text-slate-500">
                        {item.totalUnits ?? '-'} unit • kapasitas {item.availableCapacity ?? '-'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Update: {item.updatedAt || '-'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full shrink-0 ${cls}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {(logisticSummary.length === 0 && faskesSummary.length === 0) && (
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          <Building2 size={14} /> Menunggu sinkronisasi data operator dari instansi terkait.
        </div>
      )}
    </div>
  );
}
