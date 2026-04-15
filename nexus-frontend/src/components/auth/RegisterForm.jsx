import { User, Phone, MapPin, Lock } from 'lucide-react';

export default function RegisterForm() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Relawan</h2>
      <p className="text-sm text-slate-500 mb-6">Bergabunglah untuk memberikan pelaporan darurat tervalidasi di lapangan.</p>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" placeholder="Sesuai KTP" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" placeholder="johndoe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" placeholder="0812..." />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Domisili</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-slate-400" />
            <textarea className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" rows="2" placeholder="Detail alamat saat ini"></textarea>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm" placeholder="Minimal 8 karakter" />
          </div>
        </div>

        <button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-colors">
          Daftar Sekarang
        </button>
        
        <p className="text-xs text-center text-slate-500 mt-4">
          Peringatan: Pelaporan palsu (hoax) dapat dikenakan sanksi pemblokiran akun secara permanen.
        </p>
      </form>
    </div>
  );
}