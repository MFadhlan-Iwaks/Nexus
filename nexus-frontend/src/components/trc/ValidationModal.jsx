import { X, CheckCircle2, AlertTriangle, Camera, UploadCloud, BarChart } from 'lucide-react';
import { useState } from 'react';

export default function ValidationModal({ isOpen, onClose, task }) {
  const [status, setStatus] = useState(null);
  const [skala, setSkala] = useState(null); 

  if (!isOpen || !task) return null;


  const isFormComplete = status === 'hoax' || (status === 'valid' && skala !== null);

  const handleKirim = () => {
    alert(`Validasi berhasil dikirim!\nStatus: ${status.toUpperCase()}\n${status === 'valid' ? 'Skala: ' + skala.toUpperCase() : ''}`);
    onClose();
    setStatus(null);
    setSkala(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Validasi Laporan</h3>
            <p className="text-xs text-slate-500">ID: {task.id}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">1. Hasil Pemeriksaan Lokasi <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStatus('valid')}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${status === 'valid' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
              >
                <CheckCircle2 size={28} className={status === 'valid' ? 'text-emerald-600' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${status === 'valid' ? 'text-emerald-700' : 'text-slate-500'}`}>VALID (BENAR)</span>
              </button>
              <button 
                onClick={() => { setStatus('hoax'); setSkala(null); }}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${status === 'hoax' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}
              >
                <AlertTriangle size={28} className={status === 'hoax' ? 'text-red-600' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${status === 'hoax' ? 'text-red-700' : 'text-slate-500'}`}>HOAX / PALSU</span>
              </button>
            </div>
          </div>

          {status === 'valid' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BarChart size={16} /> 2. Tentukan Skala Kedaruratan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setSkala('rendah')} className={`p-3 border-2 rounded-xl text-xs font-bold transition-all ${skala === 'rendah' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-slate-200 text-slate-500 hover:border-yellow-200'}`}>
                  RENDAH
                </button>
                <button onClick={() => setSkala('sedang')} className={`p-3 border-2 rounded-xl text-xs font-bold transition-all ${skala === 'sedang' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500 hover:border-orange-200'}`}>
                  SEDANG
                </button>
                <button onClick={() => setSkala('tinggi')} className={`p-3 border-2 rounded-xl text-xs font-bold transition-all ${skala === 'tinggi' ? 'border-red-600 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:border-red-200'}`}>
                  TINGGI / KRITIS
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Camera size={16} /> {status === 'valid' ? '3.' : '2.'} Foto Bukti Validasi <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
              <UploadCloud size={24} className="text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-600">Ambil Foto Langsung</p>
              <p className="text-xs text-slate-400 mt-1 text-center">Wajib untuk pertanggungjawaban TRC</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white sticky bottom-0 z-10">
          <button 
            disabled={!isFormComplete}
            onClick={handleKirim}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${isFormComplete ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <CheckCircle2 size={18} /> Kirim Hasil Validasi
          </button>
        </div>

      </div>
    </div>
  );
}