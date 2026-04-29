'use client';

// src/components/auth/RegisterForm.jsx
// Semua fetch dipindah ke authService — komponen bersih

import { useState } from 'react';
import { Phone, MapPin, Lock, User, Loader2 } from 'lucide-react';
import { register } from '@/services/authService';

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    no_hp: '',
    alamat: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await register({
        nama: formData.nama_lengkap,
        no_hp: formData.no_hp,
        password: formData.password,
        alamat: formData.alamat,
        role: 'masyarakat',
      }); // → authService → POST /api/auth/register

      // Kembali ke tab login setelah daftar berhasil
      if (onSuccess) onSuccess();
      else window.location.reload();
    } catch (err) {
      setErrorMsg(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Masyarakat</h2>
      <p className="text-sm text-slate-500 mb-6">Bergabunglah untuk memberikan pelaporan darurat tervalidasi.</p>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-slate-800"
              placeholder="Sesuai KTP"
              value={formData.nama_lengkap}
              onChange={handleChange('nama_lengkap')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. HP (Sebagai ID Login)</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              required
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-slate-800"
              placeholder="08123456789"
              value={formData.no_hp}
              onChange={handleChange('no_hp')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
            <textarea
              required
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-slate-800"
              rows="2"
              placeholder="Detail alamat saat ini"
              value={formData.alamat}
              onChange={handleChange('alamat')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={8}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-slate-800"
              placeholder="Minimal 8 karakter"
              value={formData.password}
              onChange={handleChange('password')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Mendaftar...</>
          ) : (
            'Daftar Sekarang'
          )}
        </button>
      </form>
    </div>
  );
}