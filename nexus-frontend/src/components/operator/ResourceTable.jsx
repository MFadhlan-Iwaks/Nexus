import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit, Boxes, ShieldCheck, AlertTriangle, OctagonX, Building2, ArrowDownUp } from 'lucide-react';

export default function ResourceTable({
  activeTab,
  onAdd,
  onUpdate,
  logisticItems = [],
  faskesItems = [],
  highlightedFaskesId = '',
  highlightedLogisticsId = '',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [resourceSortMode, setResourceSortMode] = useState('default');
  const [glowRowId, setGlowRowId] = useState('');
  const isLogistik = activeTab === 'logistik';
  const isFaskes = activeTab === 'faskes';
  const resourceItems = isFaskes ? faskesItems : logisticItems;

  const getCategoryClass = (category) => {
    if (category?.includes('IGD')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category?.includes('Rawat')) return 'bg-violet-100 text-violet-700 border-violet-200';
    if (category?.includes('ICU')) return 'bg-red-100 text-red-700 border-red-200';
    if (category?.includes('Isolasi')) return 'bg-teal-100 text-teal-700 border-teal-200';
    if (category?.includes('Observasi')) return 'bg-sky-100 text-sky-700 border-sky-200';
    if (category?.includes('Darurat')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category?.includes('Pangan')) return 'bg-lime-100 text-lime-700 border-lime-200';
    if (category?.includes('Sandang')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (category?.includes('Peralatan')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (category?.includes('Obat') || category?.includes('Medis')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('Semua');
    setResourceSortMode('default');
  }, [activeTab]);

  useEffect(() => {
    const activeHighlightId = isFaskes ? highlightedFaskesId : isLogistik ? highlightedLogisticsId : '';
    if (!activeHighlightId) return;

    setGlowRowId(activeHighlightId);
    const timer = setTimeout(() => setGlowRowId(''), 2500);
    return () => clearTimeout(timer);
  }, [highlightedFaskesId, highlightedLogisticsId, isFaskes, isLogistik]);

  // Status class berbeda: logistik vs faskes
  const getStatusClass = (status) => {
    // Faskes: Tersedia | Hampir Penuh | Penuh
    if (status === 'Penuh') return 'bg-red-100 text-red-700';
    if (status === 'Hampir Penuh') return 'bg-amber-100 text-amber-700';
    if (status === 'Tersedia') return 'bg-emerald-100 text-emerald-700';
    // Logistik: Aman | Menipis | Habis
    if (status === 'Habis') return 'bg-red-100 text-red-700';
    if (status === 'Menipis') return 'bg-amber-100 text-amber-700';
    if (status === 'Aman') return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-600';
  };

  // Label kolom 1 (hijau): Aman / Tersedia
  // Label kolom 2 (kuning): Menipis / Hampir Penuh
  // Label kolom 3 (merah): Habis / Penuh
  const statusLabels = isFaskes
    ? { ok: 'Tersedia', warn: 'Hampir Penuh', danger: 'Penuh' }
    : { ok: 'Aman', warn: 'Menipis', danger: 'Habis' };

  const resourceSummary = useMemo(() => {
    return resourceItems.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === statusLabels.ok) acc.aman += 1;
        if (item.status === statusLabels.warn) acc.menipis += 1;
        if (item.status === statusLabels.danger) acc.habis += 1;
        return acc;
      },
      { total: 0, aman: 0, menipis: 0, habis: 0 }
    );
  }, [resourceItems, statusLabels.ok, statusLabels.warn, statusLabels.danger]);

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = resourceItems.filter((item) => {
      const nama = (item.nama || '').toLowerCase();
      const kategori = (item.kategori || '').toLowerCase();
      const matchesSearch = query.length === 0 || nama.includes(query) || kategori.includes(query);
      const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    if (resourceSortMode === 'kapasitas-rendah') {
      return [...filtered].sort((a, b) => (a.stok ?? 0) - (b.stok ?? 0));
    }
    return filtered;
  }, [resourceItems, searchQuery, statusFilter, resourceSortMode]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      {(isLogistik || isFaskes) && (
        <div className="px-5 py-4 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">{isFaskes ? 'Pusat Faskes' : 'Pusat Logistik'}</p>
              <h3 className="text-lg font-bold">{isFaskes ? 'Kontrol Kapasitas Fasilitas' : 'Kontrol Stok Instansi'}</h3>
              <p className="text-xs text-slate-200 mt-1">
                {isFaskes
                  ? 'Pantau kapasitas bed dan ketersediaan layanan fasilitas kesehatan secara real time.'
                  : 'Pantau status aman, menipis, dan habis dalam satu panel.'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs bg-white/10 border border-white/15 rounded-lg px-3 py-2">
              {isFaskes ? <Building2 size={14} /> : <Boxes size={14} />} Sinkronisasi Aktif
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-slate-50">
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari data ${activeTab}...`} 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <button 
          onClick={onAdd} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Tambah Data Baru
        </button>
      </div>

      {(isLogistik || isFaskes) && (
        <div className="p-4 border-b border-slate-200 bg-white space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{isFaskes ? 'Total Fasilitas' : 'Total Item'}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{resourceSummary.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">{statusLabels.ok}</p>
              <p className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-2"><ShieldCheck size={18} /> {resourceSummary.aman}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700">{statusLabels.warn}</p>
              <p className="text-xl font-bold text-amber-700 mt-1 flex items-center gap-2"><AlertTriangle size={18} /> {resourceSummary.menipis}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">{statusLabels.danger}</p>
              <p className="text-xl font-bold text-red-700 mt-1 flex items-center gap-2"><OctagonX size={18} /> {resourceSummary.habis}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Semua', statusLabels.ok, statusLabels.warn, statusLabels.danger].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                {status}
              </button>
            ))}

            {isFaskes && (
              <button
                onClick={() => setResourceSortMode((prev) => (prev === 'kapasitas-rendah' ? 'default' : 'kapasitas-rendah'))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  resourceSortMode === 'kapasitas-rendah'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                <ArrowDownUp size={12} /> Kapasitas Terendah
              </button>
            )}

            {isLogistik && (
              <button
                onClick={() => setResourceSortMode((prev) => (prev === 'kapasitas-rendah' ? 'default' : 'kapasitas-rendah'))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  resourceSortMode === 'kapasitas-rendah'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                <ArrowDownUp size={12} /> Stok Terendah
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
      <table className="w-full text-left min-w-180">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <th className="p-4 font-semibold">{isFaskes ? 'Nama Fasilitas' : 'Nama / Kategori'}</th>
            {isFaskes && <th className="p-4 font-semibold">Kategori Layanan</th>}
            <th className="p-4 font-semibold">{isFaskes ? 'Sisa Kapasitas' : 'Sisa Stok'}</th>
            {(isLogistik || isFaskes) && <th className="p-4 font-semibold">Status</th>}
            <th className="p-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {(isLogistik || isFaskes) && (
            filteredResources.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-slate-50 transition-colors ${
                  glowRowId === item.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-300' : ''
                }`}
              >
                <td className="p-4 font-bold text-slate-800">
                  {item.nama}
                  {!isFaskes && (
                    <>
                      <br />
                      <span className={`inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryClass(item.kategori)}`}>
                        {item.kategori}
                      </span>
                    </>
                  )}
                </td>
                {isFaskes && (
                  <td className="p-4">
                    <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryClass(item.kategori)}`}>
                      {item.kategori}
                    </span>
                  </td>
                )}
                <td className={`p-4 font-bold text-lg ${item.stok <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {item.stok} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onUpdate({ tipe: activeTab, id: item.id, nama: item.nama, unit: item.unit, current: item.stok })}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 ml-auto"
                  >
                    <Edit size={16} /> Perbarui
                  </button>
                </td>
              </tr>
            ))
          )}

          {(isLogistik || isFaskes) && filteredResources.length === 0 && (
            <tr>
              <td colSpan={isFaskes ? 5 : 4} className="p-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  {isFaskes ? 'Data faskes tidak ditemukan' : 'Data logistik tidak ditemukan'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau pilih filter status lain.</p>
              </td>
            </tr>
          )}

        </tbody>
      </table>
      </div>
    </div>
  );
}
