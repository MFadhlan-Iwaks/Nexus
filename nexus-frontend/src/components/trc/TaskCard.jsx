import { MapPin, Clock, ShieldCheck, Image as ImageIcon, ChevronRight, Navigation, RefreshCw } from 'lucide-react';

export default function TaskCard({ data, onValidate, onDetail, onUpdate }) {
  const isMenunggu = data.status === 'menunggu';
  const isPenanganan = data.status === 'penanganan';
  const displayId = `LAP-${String(data.id).padStart(6, '0')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col relative">
      
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <div className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">
          {displayId}
        </div>
        <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
          <Navigation size={10} /> Berjarak {data.jarak || 'N/A'}
        </div>
      </div>

      <div className="h-32 bg-slate-100 relative border-b border-slate-200 flex items-center justify-center overflow-hidden">
        {data.foto ? (
          <img src={data.foto} alt="Bukti Laporan" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 flex flex-col items-center">
            <ImageIcon size={32} />
            <span className="text-xs mt-1">Tidak ada foto</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {data.judul}
          </h3>
        </div>
        
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{data.lokasi}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isMenunggu ? (
            <button 
              onClick={() => onValidate(data)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <ShieldCheck size={18} /> Validasi Awal
            </button>
          ) : isPenanganan ? (
            <button 
              onClick={() => onUpdate(data)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <RefreshCw size={18} /> Update Progres
            </button>
          ) : (
            <div className="flex-1 bg-slate-100 text-slate-500 text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-200">
              <RefreshCw size={18} /> Tidak Perlu Tindak Lanjut
            </div>
          )}
          
          <button 
            onClick={() => onDetail(data)}
            className="px-4 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            title="Lihat Detail Lengkap"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}