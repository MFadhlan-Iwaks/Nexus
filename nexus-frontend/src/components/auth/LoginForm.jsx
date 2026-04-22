'use client';
import { useState } from 'react';
// Ikon User dihapus, diganti dengan Phone
import { Phone, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  // State username diganti menjadi no_hp
  const [formData, setFormData] = useState({ no_hp: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const role = data.user.role.toLowerCase();

        if (role === 'relawan') {
          router.push('/relawan/dashboard');
        } else if (role === 'operator') {
          router.push('/operator/dashboard');
        } else if (role === 'trc') {
          router.push('/trc/dashboard');
        } else {
          router.push('/auth');
        }
        
        alert('Login Berhasil!');
      } else {
        // Tambahan agar pesan error dari backend muncul saat gagal login
        alert(data.message || 'Login Gagal, periksa kembali Nomor HP atau Password.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang Kembali</h2>
      <p className="text-sm text-slate-500 mb-6">Masukkan kredensial Anda untuk mengakses sistem.</p>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          {/* Label diubah menjadi Nomor HP */}
          <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
          <div className="relative">
            {/* Ikon diganti menjadi Phone */}
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="tel" 
              required
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-black" 
              placeholder="08xxxxxxxxxx"
              // onChange diperbarui ke no_hp
              onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
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
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-black" 
              placeholder="••••••••" 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>
        <button 
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-slate-400"
        >
          {loading ? 'Memproses...' : 'Masuk ke Sistem'} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}