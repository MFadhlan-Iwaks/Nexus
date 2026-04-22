// src/components/admin/ManajemenPengguna.jsx
import { useState } from 'react';
import { Search, UserCheck, UserX, Shield, Users, Truck, Building2 } from 'lucide-react';

export default function ManajemenPengguna() {
  // State untuk sub-tab di dalam halaman Manajemen Pengguna
  const [roleTab, setRoleTab] = useState('masyarakat'); // 'masyarakat', 'trc', 'operator'

  // --- DATA DUMMY ---
  const dataMasyarakat = [
    { id: "RLW-001", nama: "M. Fadhlan", area: "Kec. Tawang", kontak: "0812-3344-5566", status: "Terverifikasi" },
    { id: "RLW-002", nama: "Siti Nurhaliza", area: "Kec. Cipedes", kontak: "0856-7788-9900", status: "Terverifikasi" },
    { id: "RLW-003", nama: "Ahmad Dani", area: "Kec. Kawalu", kontak: "0821-1122-3344", status: "Menunggu" },
  ];

  const dataTRC = [
    { id: "TRC-001", nama: "Budi Santoso", regu: "Tim Alfa (Evakuasi)", kontak: "0811-2233-4455", status: "Siaga" },
    { id: "TRC-002", nama: "Agus Hermawan", regu: "Tim Bravo (Medis)", kontak: "0822-3344-5566", status: "Lapangan" },
  ];

  const dataOperator = [
    { id: "OPR-001", nama: "Angga N.", instansi: "Dinas Kesehatan Kota", kontak: "0833-4455-6677", status: "Aktif" },
    { id: "OPR-002", nama: "Risa Amelia", instansi: "PMI Tasikmalaya", kontak: "0844-5566-7788", status: "Aktif" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full">
      
      {/* HEADER & PENCARIAN */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Manajemen Pengguna Sistem</h2>
          <p className="text-xs text-slate-500">Kelola akses untuk Masyarakat, Petugas TRC, dan Operator Instansi.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Cari nama atau ID pengguna..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
        </div>
      </div>

      {/* SUB-TABS NAVIGASI */}
      <div className="flex border-b border-slate-200 px-5 pt-3 gap-6 bg-slate-50/50">
        <button 
          onClick={() => setRoleTab('masyarakat')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${roleTab === 'masyarakat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Users size={16}/> Masyrakat
        </button>
        <button 
          onClick={() => setRoleTab('trc')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${roleTab === 'trc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Truck size={16}/> Petugas TRC
        </button>
        <button 
          onClick={() => setRoleTab('operator')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${roleTab === 'operator' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 size={16}/> Operator Instansi
        </button>
      </div>

      {/* AREA TABEL */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-white sticky top-0 z-10">
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">ID / Nama Pengguna</th>
              <th className="p-4 font-semibold">
                {roleTab === 'masyarakat' ? 'Area Domisili' : roleTab === 'trc' ? 'Regu / Tim' : 'Instansi Asal'}
              </th>
              <th className="p-4 font-semibold">Status Akses</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            
            {/* RENDER MASYARAKAT */}
            {roleTab === 'masyarakat' && dataMasyarakat.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{item.nama}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.id} • {item.kontak}</p>
                </td>
                <td className="p-4 text-slate-600">{item.area}</td>
                <td className="p-4">
                  {item.status === 'Terverifikasi' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md"><Shield size={12} /> {item.status}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md"><UserX size={12} /> Menunggu</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {item.status === 'Menunggu' ? (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Verifikasi</button>
                  ) : (
                    <button className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Blokir</button>
                  )}
                </td>
              </tr>
            ))}

            {/* RENDER TRC */}
            {roleTab === 'trc' && dataTRC.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{item.nama}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.id} • {item.kontak}</p>
                </td>
                <td className="p-4 text-slate-600 font-medium">{item.regu}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${item.status === 'Lapangan' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Edit Akses</button>
                </td>
              </tr>
            ))}

            {/* RENDER OPERATOR */}
            {roleTab === 'operator' && dataOperator.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{item.nama}</p>
                  <p className="text-xs text-slate-500 font-mono">{item.id} • {item.kontak}</p>
                </td>
                <td className="p-4 text-slate-600 font-bold">{item.instansi}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">
                    <UserCheck size={12} /> {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Edit Akses</button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}