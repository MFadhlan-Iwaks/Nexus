"use client";

import { ShieldAlert, User, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NavbarMasyrakat({ userName = "M. Fadhlan" }) {
  const router = useRouter();

  const handleLogout = () => {
    alert("Anda telah berhasil logout dari sistem NEXUS.");
    router.push('/auth');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-8 py-3 flex justify-between items-center">
        
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-wide text-slate-900">NEXUS</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          <div className="h-8 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Masyrakat</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border-2 border-white shadow-sm overflow-hidden">
              <User size={20} />
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="ml-1 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors flex items-center gap-1"
            title="Keluar dari sistem"
          >
            <LogOut size={20} />
          </button>
        </div>

      </div>
    </header>
  );
}