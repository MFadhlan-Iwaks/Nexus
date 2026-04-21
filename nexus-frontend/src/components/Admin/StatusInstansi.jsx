// src/components/admin/StatusInstansi.jsx
import { Building2, Package, Ambulance, CheckCircle2 } from 'lucide-react';

export default function StatusInstansi() {
  const instansiData = [
    { nama: "Dinas Kesehatan Kota", tipe: "Kapasitas Medis", total: "125 Bed IGD", status: "Terhubung", update: "15 Menit lalu", icon: Ambulance, color: "text-blue-600", bg: "bg-blue-50" },
    { nama: "Dinas Sosial (Dinsos)", tipe: "Logistik Pangan", total: "5.500 Kg Beras", status: "Terhubung", update: "1 Jam lalu", icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
    { nama: "PMI Tasikmalaya", tipe: "Kantong Darah & Medis", total: "320 Kantong", status: "Terhubung", update: "2 Jam lalu", icon: Building2, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 text-lg">Rekapitulasi Kesiapan Instansi</h2>
        <p className="text-xs text-slate-500">Pantau ketersediaan logistik dan kapasitas medis dari seluruh instansi terkait secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {instansiData.map((item, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`${item.bg} ${item.color} p-3 rounded-xl`}>
                <item.icon size={24} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full uppercase">
                <CheckCircle2 size={12} /> {item.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{item.nama}</h3>
            <p className="text-xs text-slate-500 mb-4">{item.tipe}</p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Tersedia</p>
              <p className="text-xl font-bold text-slate-800">{item.total}</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
               Sinkronisasi terakhir: {item.update}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}