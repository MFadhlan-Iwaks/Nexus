'use client';

import { useState } from 'react';
// Ikon 'User' dihapus karena sudah tidak pakai username
import { Phone, MapPin, Lock } from 'lucide-react';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    // username sudah dihapus dari state
    no_hp: '',
    alamat: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Registrasi Berhasil! Silakan Login.');
        window.location.reload();
      } else {
        alert(data.message || 'Registrasi Gagal');
      }
    } catch (err) {
      alert('Gagal terhubung ke backend');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Relawan</h2>
      <p className="text-sm text-slate-500 mb-6">Bergabunglah untuk memberikan pelaporan darurat tervalidasi.</p>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input 
            type="text" 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-black" 
            placeholder="Sesuai KTP" 
            onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
          />
        </div>

        {/* Grid 2 kolom dihapus, No HP sekarang full width */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">No. HP (Sebagai ID Login)</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="tel" 
              required
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-black" 
              placeholder="08123456789" 
              onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
            <textarea 
              required
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-black" 
              rows="2" 
              placeholder="Detail alamat saat ini"
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            ></textarea>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="password" 
              required
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm text-black" 
              placeholder="Minimal 8 karakter" 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-colors">
          Daftar Sekarang
        </button>
      </form>
    </div>
  );
}