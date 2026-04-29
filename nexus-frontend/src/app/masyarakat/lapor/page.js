"use client";

// src/app/masyarakat/lapor/page.js
// Form pelaporan darurat — submit melalui reportService (backend asli)

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, MapPin, Navigation, Loader2, CheckCircle2,
  Camera, UploadCloud, ArrowLeft, Image as ImageIcon, AlertTriangle,
} from 'lucide-react';
import { createReport } from '@/services/reportService';

const KATEGORI_OPTIONS = [
  'Banjir', 'Tanah Longsor', 'Gempa Bumi', 'Kebakaran', 'Pohon Tumbang',
  'Angin Kencang', 'Gelombang Tinggi', 'Kekeringan', 'Lainnya',
];

export default function LaporDaruratPage() {
  const router = useRouter();

  const [locationState, setLocationState] = useState('idle'); // idle | loading | success
  const [coords, setCoords] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({ kategori: '', deskripsi: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  // ── GPS Detection ────────────────────────────────────────────

  const handleGetLocation = () => {
    setLocationState('loading');
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur GPS.');
      setLocationState('idle');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setCoords(
          `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} (Akurasi: ${Math.round(pos.coords.accuracy)}m)`
        );
        setLocationState('success');
      },
      () => {
        alert('Gagal mendeteksi lokasi. Pastikan izin GPS aktif.');
        setLocationState('idle');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── File Upload ──────────────────────────────────────────────

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // ── Submit ───────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (locationState !== 'success' || !lat || !lng) {
      setErrorMsg('Mohon deteksi lokasi Anda terlebih dahulu!');
      return;
    }
    if (!file) {
      setErrorMsg('Mohon unggah bukti visual kejadian!');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('kategori_bencana', formData.kategori);
      fd.append('deskripsi_kejadian', formData.deskripsi);
      fd.append('latitude', lat);
      fd.append('longitude', lng);
      fd.append('bukti_visual', file);

      // → reportService → POST /api/laporan/tambah (backend asli)
      await createReport(fd);

      router.push('/masyarakat/dashboard?laporan=terkirim');
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.push('/masyarakat/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} className="text-slate-700" />
          </button>
          <h1 className="font-bold text-lg text-slate-800">Laporan Kejadian Darurat</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Banner peringatan */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex gap-3">
          <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
            <strong>Perhatian:</strong> Pastikan Anda berada di lokasi kejadian.
            Mengirimkan laporan hoax dapat berakibat pemblokiran akun.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-700">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Lokasi GPS */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <label className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-red-600" />
              Titik Koordinat Lokasi <span className="text-red-500">*</span>
            </label>

            {locationState === 'idle' && (
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full py-5 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:border-red-400 hover:bg-red-50 transition-all flex flex-col items-center gap-2"
              >
                <Navigation size={26} className="text-slate-400" />
                Deteksi Otomatis Lokasi Saya
              </button>
            )}

            {locationState === 'loading' && (
              <div className="w-full py-6 bg-white border border-slate-200 rounded-xl flex flex-col items-center gap-3">
                <Loader2 size={28} className="text-red-600 animate-spin" />
                <span className="text-sm font-medium text-slate-600">Mencari sinyal GPS satelit...</span>
              </div>
            )}

            {locationState === 'success' && (
              <div className="w-full py-4 px-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Lokasi Berhasil Dikunci</p>
                    <p className="text-xs font-mono text-emerald-600">{coords}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 underline shrink-0"
                >
                  Perbarui
                </button>
              </div>
            )}
          </div>

          {/* 2. Upload Foto */}
          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Camera size={18} className="text-slate-500" />
              Unggah Bukti Visual <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all ${
                file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center">
                    {file?.name} — Klik untuk ganti
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <UploadCloud size={28} className="text-red-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">Ambil Foto dari Kamera</p>
                    <p className="text-xs text-slate-500 mt-1">Atau pilih dari galeri (Maks. 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Kategori & Deskripsi */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Kategori Bencana <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.kategori}
                onChange={(e) => setFormData((p) => ({ ...p, kategori: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm text-slate-800"
              >
                <option value="">-- Pilih Jenis Kejadian --</option>
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Deskripsi Kejadian <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.deskripsi}
                onChange={(e) => setFormData((p) => ({ ...p, deskripsi: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 text-sm text-slate-800 outline-none"
                rows="4"
                placeholder="Contoh: Terjadi banjir setinggi lutut orang dewasa sejak pukul 08.00..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting
                ? <><Loader2 size={20} className="animate-spin" /> MENGIRIM LAPORAN...</>
                : <><ShieldAlert size={20} /> KIRIM LAPORAN KE PUSAT KOMANDO</>
              }
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              Laporan akan divalidasi oleh Tim TRC sebelum diteruskan ke Admin BPBD.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
