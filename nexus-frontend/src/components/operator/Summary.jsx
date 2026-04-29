import { Ambulance, Package, History, TrendingUp, Building2, ShieldCheck, AlertTriangle, OctagonX, Boxes } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Summary({ activeInstitution, faskesItems = [], logisticItems = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const combined = useMemo(() => {
    const list = [
      ...faskesItems.map((i) => ({ ...i, resourceType: 'faskes' })),
      ...logisticItems.map((i) => ({ ...i, resourceType: 'logistik' })),
    ];
    return list;
  }, [faskesItems, logisticItems]);

  const getStatus = (item) => {
    if (item.resourceType === 'faskes') {
      if (item.stok <= 0) return 'Habis';
      if (item.stok <= 10) return 'Menipis';
      return 'Aman';
    }
    if (item.stok <= 0) return 'Habis';
    if (item.stok <= 100) return 'Menipis';
    return 'Aman';
  };

  const resourceSummary = useMemo(() => {
    return combined.reduce(
      (acc, item) => {
        acc.total += 1;
        const s = getStatus(item);
        if (s === 'Aman') acc.aman += 1;
        if (s === 'Menipis') acc.menipis += 1;
        if (s === 'Habis') acc.habis += 1;
        return acc;
      },
      { total: 0, aman: 0, menipis: 0, habis: 0 }
    );
  }, [combined]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return combined.filter((it) => q === '' || it.nama.toLowerCase().includes(q) || (it.kategori || '').toLowerCase().includes(q));
  }, [combined, searchQuery]);

  const faskesList = filtered.filter((i) => i.resourceType === 'faskes').sort((a,b)=>a.stok-b.stok).slice(0,8);
  const logisticList = filtered.filter((i) => i.resourceType === 'logistik').sort((a,b)=>a.stok-b.stok).slice(0,8);

  const faskesAll = useMemo(() => combined.filter(i=>i.resourceType==='faskes'), [combined]);
  const logisticAll = useMemo(() => combined.filter(i=>i.resourceType==='logistik'), [combined]);

  const computeStats = (list) => {
    return list.reduce((acc, item) => {
      acc.total += 1;
      const s = getStatus(item);
      if (s === 'Aman') acc.aman += 1;
      if (s === 'Menipis') acc.menipis += 1;
      if (s === 'Habis') acc.habis += 1;
      return acc;
    }, { total: 0, aman: 0, menipis: 0, habis: 0 });
  };

  const faskesStats = useMemo(()=> computeStats(faskesAll), [faskesAll]);
  const logisticStats = useMemo(()=> computeStats(logisticAll), [logisticAll]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden bg-linear-to-r from-slate-900 via-slate-800 to-blue-900">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Selamat Bertugas, Tim {activeInstitution || ''}!</h3>
          <p className="text-blue-100 text-sm max-w-lg">Pastikan data kapasitas layanan dan logistik {activeInstitution || 'instansi Anda'} selalu mutakhir untuk koordinasi darurat yang cepat.</p>
        </div>
        <Building2 size={120} className="absolute -right-6 -bottom-6 text-blue-500 opacity-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Fasilitas Kesehatan</p>
              <h3 className="font-bold text-lg">Kapasitas Faskes</h3>
            </div>
            <div className="relative w-56">
              <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Cari nama/ kategori..." className="w-full pl-3 pr-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Unit</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{faskesStats.total}</p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex-1">
                    <p className="text-xs text-emerald-700">Aman</p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">{faskesStats.aman}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex-1">
                    <p className="text-xs text-amber-700">Menipis</p>
                    <p className="text-xl font-bold text-amber-700 mt-1">{faskesStats.menipis}</p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex-1">
                    <p className="text-xs text-red-700">Habis</p>
                    <p className="text-xl font-bold text-red-700 mt-1">{faskesStats.habis}</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-semibold">Nama / Kategori</th>
                    <th className="p-3 font-semibold">Sisa Kapasitas</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {faskesList.map((item)=> (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{item.nama}<br /><span className="inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">{item.kategori}</span></td>
                      <td className={`p-3 font-bold text-lg ${item.stok <= 0 ? 'text-red-600' : 'text-slate-800'}`}>{item.stok} <span className="text-sm font-normal text-slate-500">{item.unit}</span></td>
                      <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatus(item) === 'Habis' ? 'bg-red-100 text-red-700' : getStatus(item) === 'Menipis' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{getStatus(item)}</span></td>
                    </tr>
                  ))}
                  {faskesList.length === 0 && (
                    <tr><td colSpan={3} className="p-6 text-center text-slate-500">Tidak ada data faskes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Logistik</p>
              <h3 className="font-bold text-lg">Ketersediaan Logistik</h3>
            </div>
            <div className="relative w-56">
              <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Cari nama/ kategori..." className="w-full pl-3 pr-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total Item</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{logisticStats.total}</p>
                </div>
                <div className="flex gap-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex-1">
                    <p className="text-xs text-emerald-700">Aman</p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">{logisticStats.aman}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex-1">
                    <p className="text-xs text-amber-700">Menipis</p>
                    <p className="text-xl font-bold text-amber-700 mt-1">{logisticStats.menipis}</p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex-1">
                    <p className="text-xs text-red-700">Habis</p>
                    <p className="text-xl font-bold text-red-700 mt-1">{logisticStats.habis}</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-semibold">Nama / Kategori</th>
                    <th className="p-3 font-semibold">Sisa Stok</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {logisticList.map((item)=> (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-800">{item.nama}<br /><span className="inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">{item.kategori}</span></td>
                      <td className={`p-3 font-bold text-lg ${item.stok <= 0 ? 'text-red-600' : 'text-slate-800'}`}>{item.stok} <span className="text-sm font-normal text-slate-500">{item.unit}</span></td>
                      <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatus(item) === 'Habis' ? 'bg-red-100 text-red-700' : getStatus(item) === 'Menipis' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{getStatus(item)}</span></td>
                    </tr>
                  ))}
                  {logisticList.length === 0 && (
                    <tr><td colSpan={3} className="p-6 text-center text-slate-500">Tidak ada data logistik.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}