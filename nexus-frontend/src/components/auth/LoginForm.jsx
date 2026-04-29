'use client';

// src/components/auth/LoginForm.jsx
// Semua fetch dipindah ke authService — komponen bersih

import { useState } from 'react';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { login, saveSession } from '@/services/authService';

export default function LoginForm() {
  const [formData, setFormData] = useState({ no_hp: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = await login(formData); // → authService → POST /api/auth/login
      saveSession(data.token, data.user);

      const role = data.user?.role?.toLowerCase();
      if (role === 'masyarakat') router.push('/masyarakat/dashboard');
      else if (role === 'operator') router.push('/operator/dashboard');
      else if (role === 'trc') router.push('/trc/dashboard');
      else if (role === 'admin') router.push('/admin/dashboard');
      else router.push('/auth');
    } catch (err) {
      setErrorMsg(err.message || 'Login gagal. Periksa nomor HP atau password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang Kembali</h2>
      <p className="text-sm text-slate-500 mb-6">Masukkan kredensial Anda untuk mengakses sistem.</p>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              required
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-800 text-sm"
              placeholder="08xxxxxxxxxx"
              value={formData.no_hp}
              onChange={handleChange('no_hp')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-800 text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange('password')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Memproses...</>
          ) : (
            <>Masuk ke Sistem <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
}