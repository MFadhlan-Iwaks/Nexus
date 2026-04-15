import { X, RefreshCw, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function UpdateProgressModal({ isOpen, onClose, task }) {
  const [fase, setFase] = useState('');

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Update Progres Penanganan</h3>
            <p className="text-xs text-slate-500">ID: {task.id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Pilih Fase Saat Ini <span className="text-red-500">*</span></label>
            <select 
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              onChange={(e) => setFase(e.target.value)}
            >
              <option value="">-- Pilih Fase Penanganan --</option>
              <option value="evakuasi">Tanggap Darurat & Evakuasi</option>
              <option value="logistik">Distribusi Bantuan Logistik</option>
              <option value="rehabilitasi">Masa Rehabilitasi & Pemulihan</option>
              <option value="selesai">Penanganan Selesai (Kasus Ditutup)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Laporan Situasi Terkini <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              rows="3" 
              placeholder="Contoh: Proses evakuasi 5 KK ke posko pengungsian sedang berlangsung..."
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Camera size={16} /> Foto Progres Terkini
            </label>
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
              <UploadCloud size={20} className="text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Unggah Dokumentasi</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
          <button 
            disabled={!fase}
            onClick={() => { alert('Progres berhasil diperbarui ke Pusat!'); onClose(); }}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${fase ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <RefreshCw size={18} /> Simpan Pembaruan Status
          </button>
        </div>

      </div>
    </div>
  );
}