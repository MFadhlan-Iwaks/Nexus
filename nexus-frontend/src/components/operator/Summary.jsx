// src/components/operator/Summary.jsx
// Dashboard beranda operator — menampilkan faskes dan logistik
// Faskes: Tersedia | Hampir Penuh | Penuh
// Logistik: Aman | Menipis | Habis

import { Building2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getFaskesStatus } from '@/services/facilityService';
import { getLogisticStatus } from '@/services/logisticService';
import { getFaskesStatusClass, getLogisticStatusClass } from '@/lib/utils';

export default function Summary({ activeInstitution, faskesItems = [], logisticItems = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const faskesList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faskesItems
      .filter((i) => !q || (i.nama || '').toLowerCase().includes(q) || (i.kategori || '').toLowerCase().includes(q))
      .sort((a, b) => (a.stok ?? 0) - (b.stok ?? 0))
      .slice(0, 8);
  }, [faskesItems, searchQuery]);

  const logisticList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return logisticItems
      .filter((i) => !q || (i.nama || '').toLowerCase().includes(q) || (i.kategori || '').toLowerCase().includes(q))
      .sort((a, b) => (a.stok ?? 0) - (b.stok ?? 0))
      .slice(0, 8);
  }, [logisticItems, searchQuery]);

  // Stats faskes (Tersedia / Hampir Penuh / Penuh)
  const faskesStats = useMemo(() => faskesItems.reduce((acc, item) => {
    acc.total++;
    const s = getFaskesStatus(item.stok);
    if (s === 'Tersedia') acc.tersedia++;
    else if (s === 'Hampir Penuh') acc.hampirPenuh++;
    else acc.penuh++;
    return acc;
  }, { total: 0, tersedia: 0, hampirPenuh: 0, penuh: 0 }), [faskesItems]);

  // Stats logistik (Aman / Menipis / Habis)
  const logisticStats = useMemo(() => logisticItems.reduce((acc, item) => {
    acc.total++;
    const s = getLogisticStatus(item.stok);
    if (s === 'Aman') acc.aman++;
    else if (s === 'Menipis') acc.menipis++;
    else acc.habis++;
    return acc;
  }, { total: 0, aman: 0, menipis: 0, habis: 0 }), [logisticItems]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Selamat Bertugas, Tim {activeInstitution || ''}!</h3>
          <p className="text-blue-100 text-sm max-w-lg">
            Pastikan data kapasitas layanan dan logistik {activeInstitution || 'instansi Anda'} selalu mutakhir untuk koordinasi darurat yang cepat.
          </p>
        </div>
        <Building2 size={120} className="absolute -right-6 -bottom-6 text-blue-500 opacity-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── Faskes ─────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Fasilitas Kesehatan</p>
              <h3 className="font-bold text-lg text-slate-800">Kapasitas Faskes</h3>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-40 px-3 py-1.5 border rounded-lg text-sm border-slate-300 outline-none"
            />
          </div>
          <div className="p-4">
            {/* Stats faskes */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total Fasilitas</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{faskesStats.total}</p>
              </div>
              <div className="flex gap-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex-1">
                  <p className="text-xs text-emerald-700">Tersedia</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{faskesStats.tersedia}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex-1">
                  <p className="text-xs text-amber-700">Hmp. Penuh</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{faskesStats.hampirPenuh}</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex-1">
                  <p className="text-xs text-red-700">Penuh</p>
                  <p className="text-xl font-bold text-red-700 mt-1">{faskesStats.penuh}</p>
                </div>
              </div>
            </div>

            {/* Tabel faskes */}
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
                  {faskesList.map((item) => {
                    const st = getFaskesStatus(item.stok ?? 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">
                          {item.nama || '-'}
                          <br />
                          <span className="inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">
                            {item.kategori || '-'}
                          </span>
                        </td>
                        <td className={`p-3 font-bold text-lg ${(item.stok ?? 0) <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.stok ?? 0} <span className="text-sm font-normal text-slate-500">{item.unit || ''}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getFaskesStatusClass(st)}`}>{st}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {faskesList.length === 0 && (
                    <tr><td colSpan={3} className="p-6 text-center text-slate-400 text-sm">Tidak ada data faskes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Logistik ─────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Logistik</p>
              <h3 className="font-bold text-lg text-slate-800">Ketersediaan Logistik</h3>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className="w-40 px-3 py-1.5 border rounded-lg text-sm border-slate-300 outline-none"
            />
          </div>
          <div className="p-4">
            {/* Stats logistik */}
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

            {/* Tabel logistik */}
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
                  {logisticList.map((item) => {
                    const st = getLogisticStatus(item.stok ?? 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">
                          {item.nama || '-'}
                          <br />
                          <span className="inline-flex mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">
                            {item.kategori || '-'}
                          </span>
                        </td>
                        <td className={`p-3 font-bold text-lg ${(item.stok ?? 0) <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {item.stok ?? 0} <span className="text-sm font-normal text-slate-500">{item.unit || ''}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getLogisticStatusClass(st)}`}>{st}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {logisticList.length === 0 && (
                    <tr><td colSpan={3} className="p-6 text-center text-slate-400 text-sm">Tidak ada data logistik.</td></tr>
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
