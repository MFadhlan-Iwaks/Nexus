"use client";

import { ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationBell from '@/components/common/NotificationBell';

export default function NavbarMasyrakat({ userName = "M. Fadhlan" }) {
  const router = useRouter();

  const masyarakatDefaultProfile = {
    name: userName,
    role: 'Masyrakat',
    id: 'MSY-001',
    phone: '0812-3344-5566',
    email: 'masyarakat@nexus.id',
    address: 'Kec. Tawang, Kota Tasikmalaya'
  };

  const masyarakatNotifications = [
    {
      id: 'msy-1',
      title: 'Peringatan Dini',
      message: 'Waspada banjir susulan di DAS Ciliwung.',
      time: '10 menit lalu',
      read: false
    },
    {
      id: 'msy-2',
      title: 'Status Laporan',
      message: 'Laporan Anda sedang diproses oleh tim TRC.',
      time: '25 menit lalu',
      read: false
    }
  ];

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
          <NotificationBell items={masyarakatNotifications} />

          <div className="h-8 w-px bg-slate-200"></div>

          <UserProfileDropdown
            defaultProfile={masyarakatDefaultProfile}
            roleClassName="text-slate-500"
            avatarClassName="bg-slate-100 text-slate-600"
          />

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