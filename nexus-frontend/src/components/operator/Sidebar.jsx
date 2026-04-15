"use client";

import { ShieldAlert, LayoutDashboard, Package, Ambulance, History, Settings, Building2, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const router = useRouter();

  const menus = [
    { id: 'beranda', label: 'Beranda Operator', icon: LayoutDashboard },
    { id: 'faskes', label: 'Kapasitas Faskes', icon: Ambulance },
    { id: 'logistik', label: 'Ketersediaan Logistik', icon: Package },
    { id: 'riwayat', label: 'Riwayat Pembaruan', icon: History },
  ];

  const handleLogout = () => {
    alert("Sesi operator diakhiri. Mengalihkan ke halaman login...");
    router.push('/auth');
  };

  const handleMenuClick = (id) => {
    setActiveTab(id);
    setIsOpen(false); 
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR UTAMA */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg"><ShieldAlert size={24} className="text-white" /></div>
            <h1 className="text-xl font-bold text-white tracking-wider">NEXUS</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 bg-slate-800/50 mb-2 border-b border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Instansi Aktif:</p>
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Building2 size={16} className="text-blue-400" /> Dinas Kesehatan Kota
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => handleMenuClick(menu.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === menu.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'hover:bg-slate-800'
              }`}
            >
              <menu.icon size={18} /> {menu.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={18} /> Pengaturan Akun
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} /> Keluar Sistem
          </button>
        </div>
      </aside>
    </>
  );
}