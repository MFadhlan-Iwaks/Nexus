// src/components/admin/BroadcastModal.jsx
import { X, Megaphone, AlertTriangle, Send, Info, Radio } from 'lucide-react';
import { useState } from 'react';

export default function BroadcastModal({ isOpen, onClose }) {
  const [level, setLevel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("SIRENE DIGITAL DIAKTIFKAN!\nBroadcast peringatan dini telah berhasil dikirim ke seluruh perangkat masyrakat di zona target.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* HEADER MODAL */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 p-2 rounded-xl">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Kirim Peringatan Dini</h3>
              <p className="text-xs text-slate-500">Sistem Broadcast Darurat BPBD</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-200 rounded-full shadow-sm border border-slate-200 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* FORMULIR BROADCAST */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          <div className="bg-amber-50 p-3 rounded-xl flex gap-3 border border-amber-100">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Gunakan fitur ini hanya untuk keadaan darurat atau himbauan resmi. Pesan akan langsung muncul di layar utama (dashboard) seluruh masyrakat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Tingkat Status <span className="text-red-500">*</span></label>
              <select 
                required
                className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium text-slate-700"
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">-- Pilih Level --</option>
                <option value="siaga">🔴 SIAGA DARURAT</option>
                <option value="waspada">🟠 WASPADA</option>
                <option value="info">🔵 INFO PENTING</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Zona Sasaran <span className="text-red-500">*</span></label>
              <select required className="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white font-medium text-slate-700">
                <option value="">-- Pilih Wilayah --</option>
                <option value="all">Broadcast Seluruh Kota</option>
                <option value="utara">Zona Utara (Kec. Cipedes)</option>
                <option value="selatan">Zona Selatan (Kec. Kawalu)</option>
                <option value="timur">Zona Timur (Kec. Purbaratu)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Judul Peringatan <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              placeholder="Cth: Waspada Banjir Susulan di DAS Ciliwung"
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">Pesan Instruksi Resmi <span className="text-red-500">*</span></label>
            <textarea 
              required
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700 leading-relaxed" 
              rows="4" 
              placeholder="Tuliskan arahan evakuasi atau informasi penting untuk masyrakat di lapangan..."
            ></textarea>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white active:scale-95"
            >
              <Radio size={18} className="animate-pulse" /> PANCARKAN PERINGATAN SEKARANG
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}