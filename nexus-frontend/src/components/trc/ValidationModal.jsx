// src/components/trc/ValidationModal.jsx
// TRC validasi laporan → tulis ke shared store via reportService → admin ikut berubah

import { X, CheckCircle2, AlertTriangle, BarChart, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { validateReport } from '@/services/reportService';
import { getLocalUser } from '@/services/authService';

export default function ValidationModal({ isOpen, onClose, task, onSuccess }) {
  const [status, setStatus] = useState(null);
  const [skala, setSkala] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const isFormComplete = status === 'hoax' || (status === 'valid' && skala !== null);

  const handleKirim = async () => {
    if (!isFormComplete) return;
    setLoading(true);
    try {
      const user = getLocalUser();
      await validateReport(task.id, {
        status_validasi: status,
        skala_kedaruratan: status === 'valid' ? skala : 'rendah',
        fase_penanganan: 'Identifikasi & Asesmen',
        catatan,
        petugas: user?.nama || user?.name || 'Petugas TRC',
        trcId: user?.id || 'TRC-XXX',
      });

      onSuccess?.({ id: task.id, status_validasi: status, skala_kedaruratan: skala });
      onClose();
      setStatus(null); setSkala(null); setCatatan('');
    } catch (err) {
      alert(`Gagal mengirim validasi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Validasi Laporan</h3>
            <p className="text-xs text-slate-500">ID: {task.id} • {task.judul}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* 1. Status Validasi */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              1. Hasil Pemeriksaan Lokasi <span className="text-red-500">*</span>
            </label>
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

          {/* 2. Skala Kedaruratan (hanya jika valid) */}
          {status === 'valid' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BarChart size={16} /> 2. Skala Kedaruratan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 'rendah', label: 'RENDAH', active: 'border-yellow-400 bg-yellow-50 text-yellow-700', hover: 'hover:border-yellow-200' },
                  { val: 'sedang', label: 'SEDANG', active: 'border-orange-500 bg-orange-50 text-orange-700', hover: 'hover:border-orange-200' },
                  { val: 'tinggi', label: 'TINGGI / KRITIS', active: 'border-red-600 bg-red-50 text-red-700', hover: 'hover:border-red-200' },
                ].map(({ val, label, active, hover }) => (
                  <button
                    key={val}
                    onClick={() => setSkala(val)}
                    className={`p-3 border-2 rounded-xl text-xs font-bold transition-all ${skala === val ? active : `border-slate-200 text-slate-500 ${hover}`}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Catatan */}
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              {status === 'valid' ? '3.' : '2.'} Catatan Lapangan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows="3"
              placeholder="Keterangan situasi lapangan, kondisi warga, dll..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white sticky bottom-0">
          <button
            disabled={!isFormComplete || loading}
            onClick={handleKirim}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2
              ${isFormComplete && !loading ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
              : <><CheckCircle2 size={18} /> Kirim Hasil Validasi ke Admin</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}