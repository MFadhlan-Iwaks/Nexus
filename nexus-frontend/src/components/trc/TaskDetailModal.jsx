import { X, MapPin, Clock, User, ShieldCheck, AlignLeft, Layers, Navigation } from 'lucide-react';

export default function TaskDetailModal({ isOpen, onClose, task, onOpenValidation }) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Detail Laporan Darurat</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase mt-1 inline-block">
              ID: {task.id}
            </span>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="overflow-y-auto p-0 flex-1">
          <div className="w-full h-48 sm:h-56 bg-slate-100 relative">
             {task.foto ? (
              <img src={task.foto} alt="Bukti Lapangan" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <span className="text-sm">Tidak ada bukti visual</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Clock size={14} /> {task.waktu}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            
            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">{task.judul}</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-md border border-red-100 uppercase">
                  <Layers size={14} /> Kategori: {task.kategori}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">
                  <User size={14} /> Pelapor: {task.pelapor}
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <AlignLeft size={16} className="text-slate-400" /> Deskripsi Kejadian
              </h5>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                {task.deskripsi}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Informasi Lokasi
              </h5>
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 mb-1">Alamat Pendekatan:</p>
                  <p className="text-sm text-slate-600">{task.lokasi}</p>
                </div>
                <div className="p-4 bg-slate-100/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Titik Geotagging (GPS):</p>
                    <p className="text-xs font-mono text-slate-700">{task.koordinat}</p>
                  </div>
                  <button className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:text-blue-800 border border-slate-200" title="Buka di Peta">
                    <Navigation size={18} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button 
            onClick={() => {
              onClose(); 
              onOpenValidation(task); 
            }}
            className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            <ShieldCheck size={18} /> Lakukan Validasi
          </button>
        </div>

      </div>
    </div>
  );
}