

import { Ambulance, Building2, Package } from 'lucide-react';
import { getFaskesStatusClass, getLogisticStatusClass } from '@/lib/utils';

function getInstitutionName(item) {
  return item.institusi || item.lokasi || item.institution || item.wilayah || 'Instansi Tidak Diketahui';
}

function getLogisticStatus(stok) {
  const value = Number(stok ?? 0);
  if (value <= 0) return 'Habis';
  if (value <= 100) return 'Menipis';
  return 'Aman';
}

function getFaskesStatus(kapasitas) {
  const value = Number(kapasitas ?? 0);
  if (value <= 0) return 'Penuh';
  if (value <= 5) return 'Hampir Penuh';
  return 'Tersedia';
}

function groupByInstitution(items) {
  return items.reduce((groups, item) => {
    const key = getInstitutionName(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function formatUpdateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SummaryFallback({ title, items, type }) {
  if (!items.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-slate-800 text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.id || item.institution} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="font-semibold text-sm text-slate-800">{item.institution || '-'}</p>
            <p className="text-xs text-slate-500">
              {type === 'logistik'
                ? `${item.totalItems ?? '-'} item | stok ${item.availableStock ?? '-'}`
                : `${item.totalUnits ?? '-'} unit | kapasitas ${item.availableCapacity ?? '-'}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatusInstansi({
  logisticSummary = [],
  faskesSummary = [],
  logisticItems = [],
  faskesItems = [],
}) {
  const groupedLogistics = groupByInstitution(logisticItems);
  const groupedFaskes = groupByInstitution(faskesItems);
  const hasLogisticDetails = logisticItems.length > 0;
  const hasFaskesDetails = faskesItems.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 text-lg">Monitoring Sumber Daya Instansi</h2>
        <p className="text-xs text-slate-500">
          Data lengkap per instansi: barang logistik, stok, unit layanan kesehatan, kapasitas, dan status terkini.
        </p>
      </div>

      <div className="space-y-6">
        <section className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Package size={18} /></div>
            <h3 className="font-bold text-slate-800">Detail Logistik per Instansi</h3>
          </div>

          {hasLogisticDetails ? (
            <div className="space-y-4">
              {Object.entries(groupedLogistics).map(([institution, items]) => (
                <div key={institution} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{institution}</p>
                      <p className="text-xs text-slate-500">{items.length} item logistik</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-160">
                      <thead className="text-xs text-slate-500 bg-white">
                        <tr>
                          <th className="px-4 py-2 font-bold">Nama Barang</th>
                          <th className="px-4 py-2 font-bold">Kategori</th>
                          <th className="px-4 py-2 font-bold">Stok</th>
                          <th className="px-4 py-2 font-bold">Update</th>
                          <th className="px-4 py-2 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {items.map((item) => {
                          const status = item.status || getLogisticStatus(item.stok);
                          return (
                            <tr key={item.id || item.nama} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{item.nama || '-'}</td>
                              <td className="px-4 py-3 text-slate-500">{item.kategori || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">{item.stok ?? '-'} {item.unit || ''}</td>
                              <td className="px-4 py-3 text-slate-500">{formatUpdateTime(item.terakhir_update || item.updated_at)}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getLogisticStatusClass(status)}`}>{status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SummaryFallback title="Ringkasan Logistik" items={logisticSummary} type="logistik" />
          )}
        </section>

        <section className="border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-violet-50 text-violet-600 p-2 rounded-lg"><Ambulance size={18} /></div>
            <h3 className="font-bold text-slate-800">Detail Fasilitas Layanan Kesehatan</h3>
          </div>

          {hasFaskesDetails ? (
            <div className="space-y-4">
              {Object.entries(groupedFaskes).map(([institution, items]) => (
                <div key={institution} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <p className="font-bold text-slate-800">{institution}</p>
                    <p className="text-xs text-slate-500">{items.length} unit/layanan kesehatan</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-160">
                      <thead className="text-xs text-slate-500 bg-white">
                        <tr>
                          <th className="px-4 py-2 font-bold">Unit / Layanan</th>
                          <th className="px-4 py-2 font-bold">Kategori</th>
                          <th className="px-4 py-2 font-bold">Kapasitas</th>
                          <th className="px-4 py-2 font-bold">Update</th>
                          <th className="px-4 py-2 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {items.map((item) => {
                          const capacity = item.kapasitas_tersedia ?? item.stok;
                          const status = item.status || getFaskesStatus(capacity);
                          return (
                            <tr key={item.id || item.nama_fasilitas || item.nama} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{item.nama_fasilitas || item.nama || '-'}</td>
                              <td className="px-4 py-3 text-slate-500">{item.kategori || item.tipe || '-'}</td>
                              <td className="px-4 py-3 text-slate-700">
                                {capacity ?? '-'} {item.satuan || item.unit || ''}
                                {item.kapasitas_total ? <span className="text-slate-400"> / {item.kapasitas_total}</span> : null}
                              </td>
                              <td className="px-4 py-3 text-slate-500">{formatUpdateTime(item.updated_at || item.terakhir_update)}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${getFaskesStatusClass(status)}`}>{status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <SummaryFallback title="Ringkasan Fasilitas Kesehatan" items={faskesSummary} type="faskes" />
          )}
        </section>
      </div>

      {(!hasLogisticDetails && !hasFaskesDetails && logisticSummary.length === 0 && faskesSummary.length === 0) && (
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
          <Building2 size={14} /> Menunggu sinkronisasi data operator dari instansi terkait.
        </div>
      )}
    </div>
  );
}
