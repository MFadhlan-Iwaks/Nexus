import { Ambulance, Package, History, TrendingUp, Building2 } from 'lucide-react';

export default function Summary() {
  const stats = [
    { label: 'Total Faskes', value: '12 Unit', sub: '85 Bed Tersedia', icon: Ambulance, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Item Logistik', value: '45 Jenis', sub: 'Stok Aman', icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pembaruan Hari Ini', value: '8 kali', sub: 'Sinkron Terjaga', icon: History, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Selamat Bertugas, Angga!</h3>
          <p className="text-blue-100 text-sm max-w-lg">Pastikan data fasilitas dan logistik instansi Anda selalu mutakhir untuk mendukung keputusan darurat[cite: 36].</p>
        </div>
        <Building2 size={120} className="absolute -right-6 -bottom-6 text-blue-500 opacity-50" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className={item.color + " p-3 rounded-lg w-fit mb-4"}><item.icon size={24}/></div>
            <p className="text-2xl font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}