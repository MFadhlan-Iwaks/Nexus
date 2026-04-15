"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, MapPin, Navigation, Loader2, CheckCircle2, 
  Camera, UploadCloud, ArrowLeft 
} from 'lucide-react';

export default function LaporDaruratPage() {
  const router = useRouter();
  
  const [locationState, setLocationState] = useState('idle'); 
  const [coords, setCoords] = useState('');

  const handleGetLocation = () => {
    setLocationState('loading');
    setTimeout(() => {
      setLocationState('success');
      setCoords('-7.332301, 108.214150 (Akurasi: 4 meter)'); 
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locationState !== 'success') {
      alert("Mohon deteksi lokasi Anda terlebih dahulu!");
      return;
    }
    alert("Laporan berhasil dikirim dan sedang menunggu validasi TRC!");
    router.push('/relawan/dashboard'); 
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.push('/relawan/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Laporan Kejadian Darurat</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-3">
          <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
            <strong>Perhatian:</strong> Pastikan Anda berada di lokasi kejadian (aman dari bahaya langsung). Mengirimkan laporan palsu (hoax) akan mengakibatkan pemblokiran akun permanen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-red-600" />
              Titik Koordinat Lokasi (Geotagging)
              <span className="text-red-500">*</span>
            </label>
            
            {locationState === 'idle' && (
              <button 
                type="button"
                onClick={handleGetLocation}
                className="w-full py-4 px-4 bg-white border-2 border-dashed border-slate-300 rounded-lg text-slate-600 font-medium hover:border-red-500 hover:text-red-600 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <Navigation size={24} />
                Deteksi Otomatis Lokasi Saya Saat Ini
              </button>
            )}

            {locationState === 'loading' && (
              <div className="w-full py-6 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="text-red-600 animate-spin" />
                <span className="text-sm font-medium text-slate-600">Mencari sinyal GPS satelit...</span>
              </div>
            )}

            {locationState === 'success' && (
              <div className="w-full py-4 px-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-800 font-bold mb-0.5">Lokasi Berhasil Dikunci</p>
                    <p className="text-xs text-emerald-600 font-mono">{coords}</p>
                  </div>
                </div>
                <button type="button" onClick={handleGetLocation} className="text-xs font-bold text-slate-500 underline hover:text-slate-800">
                  Perbarui
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Camera size={18} className="text-slate-500" />
              Unggah Bukti Visual
              <span className="text-red-500">*</span>
            </label>
            <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={28} className="text-red-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Ambil Foto dari Kamera</p>
              <p className="text-xs text-slate-500 text-center">Atau pilih dari galeri (Max. 5MB)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Kategori Bencana <span className="text-red-500">*</span></label>
              <select className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none text-slate-700">
                <option value="">-- Pilih Jenis Kejadian --</option>
                <option value="banjir">Banjir</option>
                <option value="longsor">Tanah Longsor</option>
                <option value="gempa">Gempa Bumi</option>
                <option value="kebakaran">Kebakaran</option>
                <option value="pohon_tumbang">Pohon Tumbang / Infrastruktur Rusak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Deskripsi Kejadian <span className="text-red-500">*</span></label>
              <textarea 
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                rows="4"
                placeholder="Contoh: Terjadi banjir setinggi lutut orang dewasa. Arus cukup deras..."
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ShieldAlert size={20} />
              KIRIM LAPORAN KE PUSAT KOMANDO
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}