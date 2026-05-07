


import { X, RefreshCw, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { useState } from 'react';
import { updateReportProgress } from '@/services/reportService';

const FASE_OPTIONS = [
  { value: 'Identifikasi & Asesmen', label: 'Identifikasi & Asesmen' },
  { value: 'Tanggap Darurat & Evakuasi', label: 'Tanggap Darurat & Evakuasi' },
  { value: 'Distribusi Bantuan Logistik', label: 'Distribusi Bantuan Logistik' },
  { value: 'Rehabilitasi & Pemulihan', label: 'Rehabilitasi & Pemulihan' },
  { value: 'Penanganan Selesai', label: 'Penanganan Selesai (Kasus Ditutup)' },
];

export default function UpdateProgressModal({ isOpen, onClose, task, onSuccess }) {
  const [fase, setFase] = useState('');
  const [catatan, setCatatan] = useState('');
  const [fotoProgress, setFotoProgress] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFase('');
    setCatatan('');
    setFotoProgress(null);
    setFotoPreview('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !task) return null;

  const handleSimpan = async () => {
    if (!fase) return;
    setLoading(true);
    try {
      const result = await updateReportProgress(task.id, {
        fase_penanganan: fase,
        catatan,
        foto_progress: fotoProgress,
      });

      onSuccess?.({
        id: task.id,
        fase_penanganan: fase,
        catatan,
        status: fase === 'Penanganan Selesai' ? 'selesai' : 'penanganan',
        foto_progress: result.data?.foto_progress_url || fotoPreview,
      });
      onClose();
      resetForm();
    } catch (err) {
      alert(`Gagal memperbarui progres: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">

        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Update Progres Penanganan</h3>
            <p className="text-xs text-slate-500">ID: {task.id} • {task.judul}</p>
          </div>
          <button onClick={handleClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              Fase Penanganan Saat Ini <span className="text-red-500">*</span>
            </label>
            <select
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
            >
              <option value="">-- Pilih Fase Penanganan --</option>
              {FASE_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              Laporan Situasi Terkini
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              rows="3"
              placeholder="Contoh: Proses evakuasi 5 KK ke posko pengungsian sedang berlangsung..."
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              Foto Progres Penanganan
            </label>
            <label className="block border border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFotoProgress(file);
                  setFotoPreview(file ? URL.createObjectURL(file) : '');
                }}
              />
              {fotoPreview ? (
                <img src={fotoPreview} alt="Preview foto progres" className="w-full h-40 object-cover" />
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <ImageIcon size={28} />
                  <span className="text-sm font-semibold">Pilih foto progres</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Upload size={12} /> JPG, PNG, atau WebP
                  </span>
                </div>
              )}
            </label>
          </div>

          
          {fase === 'Penanganan Selesai' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
              ✓ Fase ini akan menandai kasus sebagai <strong>Selesai</strong> di dashboard Admin.
            </div>
          )}
        </div>

        
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
          <button
            disabled={!fase || loading}
            onClick={handleSimpan}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${fase && !loading ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
              : <><RefreshCw size={18} /> Simpan Pembaruan</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
