import { X, RefreshCw, Camera, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function UpdateProgressModal({ isOpen, onClose, task, onSubmit, isSubmitting = false }) {
  const [fase, setFase] = useState('');
  const [pesanSituasi, setPesanSituasi] = useState('');
  const [fotoFile, setFotoFile] = useState(null);

  const phaseOptions = [
    { value: 'evakuasi', label: 'Tanggap Darurat & Evakuasi' },
    { value: 'logistik', label: 'Distribusi Bantuan Logistik' },
    { value: 'rehabilitasi', label: 'Masa Rehabilitasi & Pemulihan' },
    { value: 'selesai', label: 'Penanganan Selesai (Kasus Ditutup)' }
  ];

  if (!isOpen || !task) return null;

  const handleSubmit = async () => {
    await onSubmit({
      taskId: task.id,
      fase,
      pesanSituasi,
      fotoFile
    });
    setFase('');
    setPesanSituasi('');
    setFotoFile(null);
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {phaseOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFase(option.value)}
                  className={`text-left p-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                    fase === option.value
                      ? option.value === 'selesai'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-blue-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {fase === 'selesai' && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Fase final dipilih. Laporan akan ditandai selesai setelah disimpan.
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Laporan Situasi Terkini <span className="text-red-500">*</span></label>
            <textarea 
              value={pesanSituasi}
              onChange={(e) => setPesanSituasi(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              rows="3" 
              placeholder="Contoh: Proses evakuasi 5 KK ke posko pengungsian sedang berlangsung..."
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Camera size={16} /> Foto Progres Terkini
            </label>
            <label className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
              />
              <UploadCloud size={20} className="text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Unggah Dokumentasi</p>
              {fotoFile && <p className="text-xs text-emerald-600 mt-2 font-semibold">{fotoFile.name}</p>}
            </label>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
          <button 
            disabled={!fase || isSubmitting}
            onClick={handleSubmit}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${fase && !isSubmitting ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <RefreshCw size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Pembaruan Status'}
          </button>
        </div>

      </div>
    </div>
  );
}