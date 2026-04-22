// src/app/admin/dashboard/page.js
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldAlert, Users, Ambulance, Megaphone, Activity, LogOut, Bell, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BroadcastModal from '@/components/admin/BroadcastModal';
import ManajemenMasyrakat from '@/components/Admin/ManajemenPengguna'; // IMPORT BARU
import StatusInstansi from '@/components/admin/StatusInstansi'; // IMPORT BARU

const MapWithNoSSR = dynamic(() => import('@/components/admin/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center rounded-2xl border border-slate-200">
      <div className="flex flex-col items-center text-slate-400">
        <Activity size={32} className="animate-bounce mb-2" />
        <p className="font-semibold text-sm">Memuat Sistem Spasial BPBD...</p>
      </div>
    </div>
  )
});

export default function AdminExecutiveDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('peta'); // 'peta', 'masyrakat', 'instansi'
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Helper untuk class menu sidebar aktif
  const getMenuClass = (tabId) => {
    return `w-full flex items-center gap-3 p-3 lg:px-4 rounded-xl font-medium justify-center lg:justify-start transition-all ${
      activeTab === tabId 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800">
      
      {/* SIDEBAR ADMIN */}
      <aside className="w-20 lg:w-64 bg-slate-900 flex flex-col h-screen transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <ShieldAlert size={24} className="text-red-500" />
          <span className="text-white font-bold text-xl ml-3 tracking-wide hidden lg:block">NEXUS <span className="text-slate-500 text-xs font-normal">COMMAND</span></span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          <button onClick={() => setActiveTab('peta')} className={getMenuClass('peta')}>
            <LayoutDashboard size={20} /> <span className="hidden lg:block">Peta Komando</span>
          </button>
          <button onClick={() => setActiveTab('masyrakat')} className={getMenuClass('masyrakat')}>
            <Users size={20} /> <span className="hidden lg:block">Manajemen Pengguna</span>
          </button>
          <button onClick={() => setActiveTab('instansi')} className={getMenuClass('instansi')}>
            <Ambulance size={20} /> <span className="hidden lg:block">Status Instansi</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => router.push('/auth')} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors justify-center lg:justify-start">
            <LogOut size={20} /> <span className="hidden lg:block font-medium">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* AREA UTAMA */}
      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div>
            <h1 className="font-bold text-lg text-slate-800 hidden sm:block">Executive Dashboard - Pusat Komando BPBD</h1>
            <h1 className="font-bold text-lg text-slate-800 sm:hidden">Pusat Komando</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">Kepala BPBD</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md">AD</div>
            </div>
          </div>
        </header>

        {/* KONTEN DINAMIS BERDASARKAN TAB */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden bg-slate-50 flex flex-col lg:flex-row gap-6">
          
          {/* JIKA TAB PETA AKTIF (Tampilkan Peta + Panel Kanan) */}
          {activeTab === 'peta' && (
            <>
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative animate-in fade-in">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" /> Pemantauan Spasial Live
                  </h2>
                </div>
                <div className="flex-1 relative p-2 pb-2">
                  <MapWithNoSSR />
                </div>
              </div>

              {/* PANEL KANAN (Hanya muncul di Tab Peta) */}
              <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pb-6 animate-in slide-in-from-right-8">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Megaphone size={18} /> Peringatan Dini (EWS)</h3>
                  <p className="text-xs text-red-700 mb-4 leading-relaxed">Kirim notifikasi langsung ke Dashboard Masyrakat.</p>
                  <button onClick={() => setIsBroadcastModalOpen(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                    <Megaphone size={16} /> Buat Broadcast Baru
                  </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex-1 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm">Log Aktivitas Terbaru</h3>
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center -translate-x-1/2 border-[3px] border-white"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div></div>
                      <p className="text-xs font-bold text-slate-800">TRC Budi memvalidasi Longsor</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2 Menit yang lalu</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* JIKA TAB MASYRAKAT AKTIF */}
          {activeTab === 'masyrakat' && (
            <div className="w-full h-full">
              <ManajemenMasyrakat />
            </div>
          )}

          {/* JIKA TAB INSTANSI AKTIF */}
          {activeTab === 'instansi' && (
            <div className="w-full h-full">
              <StatusInstansi />
            </div>
          )}

        </div>
      </main>

      <BroadcastModal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} />
    </div>
  );
}