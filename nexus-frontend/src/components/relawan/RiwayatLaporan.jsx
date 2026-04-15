import { MapPin, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export default function RiwayatLaporan() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-700">Riwayat Laporan Anda</h3>
        <button className="text-sm text-red-600 font-medium hover:underline">Lihat Semua</button>
      </div>

      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="bg-slate-100 p-3 rounded-lg text-slate-500 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors">Pohon Tumbang Menutup Jalan</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1"><Clock size={12} /> Hari ini, 14:30 WIB</span>
              </div>
              <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded-md">
                <Clock size={12} /> Menunggu Validasi TRC
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-400 group-hover:text-red-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="bg-slate-100 p-3 rounded-lg text-slate-500 shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors">Banjir Genangan 50cm</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1"><Clock size={12} /> Kemarin, 08:15 WIB</span>
              </div>
              <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded-md">
                <CheckCircle2 size={12} /> Tervalidasi (Ditangani)
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-400 group-hover:text-red-600" />
        </div>
      </div>
    </section>
  );
}