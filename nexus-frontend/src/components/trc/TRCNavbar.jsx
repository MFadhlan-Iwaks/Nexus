"use client";

import { ShieldAlert, Bell, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TRCNavbar({ userName = "Budi S." }) {
  const router = useRouter();

  const handleLogout = () => {
    alert("Sesi TRC diakhiri. Mengalihkan ke halaman login...");
    router.push('/auth');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full shadow-sm">
      <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg text-white shadow-sm">
            <ShieldAlert size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            NEXUS <span className="text-red-600 text-sm font-normal">TRC</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          
          <button className="relative text-slate-500 hover:text-slate-700 transition-colors p-1">
             <Bell size={20} />
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Petugas Lapangan</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 overflow-hidden shrink-0">
              <User size={18} />
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