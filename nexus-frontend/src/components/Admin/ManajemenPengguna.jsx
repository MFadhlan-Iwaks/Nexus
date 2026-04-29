// src/components/admin/ManajemenPengguna.jsx
import { useMemo, useState } from 'react';
import { Search, UserCheck, UserX, Users } from 'lucide-react';

export default function ManajemenPengguna({ users = [], onRoleChange, onToggleUser }) {
  const [roleFilter, setRoleFilter] = useState('semua');
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const nama = u.nama || u.name || '';
      const roleMatch = roleFilter === 'semua' || u.role === roleFilter;
      const queryMatch = q === '' || nama.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      return roleMatch && queryMatch;
    });
  }, [users, roleFilter, query]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full">
      
      {/* HEADER & PENCARIAN */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Manajemen Pengguna Sistem</h2>
          <p className="text-xs text-slate-500">Kelola user lintas role: masyarakat, TRC, operator, dan admin.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="semua">Semua Role</option>
            <option value="masyarakat">Masyarakat</option>
            <option value="trc">TRC</option>
            <option value="operator">Operator</option>
            <option value="admin">Admin</option>
          </select>
          <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Cari nama atau ID pengguna..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
          </div>
        </div>
      </div>

      {/* AREA TABEL */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">ID / Nama Pengguna</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Wilayah / Unit</th>
              <th className="p-4 font-semibold">Status Akses</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.map((item) => {
              // Support field lama (name, active, region) dan baru (nama, aktif, wilayah)
              const namaUser = item.nama || item.name || '-';
              const isAktif = item.aktif ?? item.active ?? true;
              const wilayah = item.wilayah || item.region || '-';
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{namaUser}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.id}</p>
                  </td>
                  <td className="p-4 text-slate-600 capitalize">{item.role}</td>
                  <td className="p-4 text-slate-600 text-xs">{wilayah}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isAktif ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {isAktif ? <UserCheck size={12} /> : <UserX size={12} />} {isAktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={item.role}
                        onChange={(e) => onRoleChange?.(item.id, e.target.value)}
                        className="border border-slate-300 rounded-lg px-2 py-1 text-xs bg-white"
                      >
                        <option value="masyarakat">Masyarakat</option>
                        <option value="trc">TRC</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => onToggleUser?.(item.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isAktif ? 'text-red-600 border border-red-200 hover:bg-red-50' : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'}`}>
                        {isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-slate-500">Tidak ada user yang sesuai filter.</td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
}