"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, MapPin, Navigation, Loader2, CheckCircle2, 
  Camera, UploadCloud, ArrowLeft, Image as ImageIcon 
} from 'lucide-react';

export default function LaporDaruratPage() {
  const router = useRouter();
  
  // States
  const [locationState, setLocationState] = useState('idle'); 
  const [coords, setCoords] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ kategori: '', deskripsi: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Fungsi Deteksi GPS Asli
  const handleGetLocation = () => {
    setLocationState('loading');
    
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur GPS.");
      setLocationState('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setCoords(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)} (Akurasi: ${Math.round(position.coords.accuracy)}m)`);
        setLocationState('success');
      },
      (error) => {
        alert("Gagal mendeteksi lokasi. Pastikan izin GPS aktif.");
        setLocationState('idle');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Fungsi Handle File
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) { // Max 5MB
            alert("Ukuran foto terlalu besar. Maksimal 5MB.");
            return;
        }
        setFile(selectedFile);
    }
  };

  // Fungsi Kirim ke Backend Kibar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locationState !== 'success' || !lat || !lng) {
      return alert("Mohon deteksi lokasi Anda terlebih dahulu!");
    }
    if (!file) {
      return alert("Mohon unggah bukti visual!");
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Karena ada file, kita kirim sebagai FormData (bukan JSON)
      const data = new FormData();
      data.append('kategori_bencana', formData.kategori);
      data.append('deskripsi_kejadian', formData.deskripsi);
      data.append('latitude', lat);
      data.append('longitude', lng);
      data.append('bukti_visual', file);

      const response = await fetch('http://localhost:5000/api/laporan/tambah', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
          // Catatan: Jangan tambahkan 'Content-Type': 'application/json' jika pakai FormData
        },
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        alert("Laporan berhasil dikirim dan sedang menunggu validasi TRC!");
        router.push('/relawan/dashboard'); 
      } else {
        alert(result.message || "Gagal mengirim laporan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.push('/relawan/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Laporan Kejadian Darurat</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-3">
          <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
            <strong>Perhatian:</strong> Pastikan Anda berada di lokasi kejadian. Mengirimkan laporan hoax dapat berakibat pemblokiran.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SEKSI LOKASI */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MapPin size={18} className="text-red-600" /> Titik Koordinat Lokasi <span className="text-red-500">*</span>
            </label>
            
            {locationState === 'idle' && (
              <button type="button" onClick={handleGetLocation} className="w-full py-4 bg-white border-2 border-dashed border-slate-300 rounded-lg text-slate-600 font-medium hover:border-red-500 transition-colors flex flex-col items-center gap-2">
                <Navigation size={24} /> Deteksi Otomatis Lokasi Saya
              </button>
            )}

            {locationState === 'loading' && (
              <div className="w-full py-6 bg-white border border-slate-200 rounded-lg flex flex-col items-center gap-3">
                <Loader2 size={28} className="text-red-600 animate-spin" />
                <span className="text-sm font-medium">Mencari sinyal GPS satelit...</span>
              </div>
            )}

            {locationState === 'success' && (
              <div className="w-full py-4 px-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Lokasi Berhasil Dikunci</p>
                    <p className="text-xs font-mono text-emerald-600">{coords}</p>
                  </div>
                </div>
                <button type="button" onClick={handleGetLocation} className="text-xs font-bold text-slate-500 underline">Perbarui</button>
              </div>
            )}
          </div>

          {/* SEKSI UNGGAH FOTO */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Camera size={18} className="text-slate-500" /> Unggah Bukti Visual <span className="text-red-500">*</span>
            </label>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" // Prioritaskan kamera belakang di HP
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current.click()}
              className={`w-full bg-slate-50 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:bg-slate-100'}`}
            >
              {file ? (
                <>
                  <ImageIcon size={28} className="text-emerald-500 mb-2" />
                  <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                  <p className="text-xs text-emerald-600">Klik untuk mengganti foto</p>
                </>
              ) : (
                <>
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <UploadCloud size={28} className="text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Ambil Foto dari Kamera</p>
                  <p className="text-xs text-slate-500">Atau pilih dari galeri (Max. 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* SEKSI KATEGORI & DESKRIPSI */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Kategori Bencana <span className="text-red-500">*</span></label>
              <select 
                required
                value={formData.kategori}
                onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500"
              >
                <option value="">-- Pilih Jenis Kejadian --</option>
                <option value="Banjir">Banjir</option>
                <option value="Tanah Longsor">Tanah Longsor</option>
                <option value="Gempa Bumi">Gempa Bumi</option>
                <option value="Kebakaran">Kebakaran</option>
                <option value="Pohon Tumbang">Pohon Tumbang</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Deskripsi Kejadian <span className="text-red-500">*</span></label>
              <textarea 
                required
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 text-sm"
                rows="4"
                placeholder="Contoh: Terjadi banjir setinggi lutut orang dewasa..."
              ></textarea>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ShieldAlert size={20} />}
              {isSubmitting ? 'MENGIRIM...' : 'KIRIM LAPORAN KE PUSAT KOMANDO'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}