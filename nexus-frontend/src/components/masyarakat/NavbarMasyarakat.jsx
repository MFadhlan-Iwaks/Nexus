"use client";

import { ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/masyarakat/NotificationBell';
import UserProfileDropdown from '@/components/masyarakat/UserProfileDropdown';

export default function NavbarMasyarakat({ userName = "M. Fadhlan" }) {
  const router = useRouter();

  const masyarakatDefaultProfile = {
    name: userName,
    role: 'Masyarakat',
    id: 'MYS-001',
    phone: '0812-3456-7890',
    email: 'masyarakat@nexus.id',
    address: 'Domisili pengguna',
    instansi: 'Warga'
  };

  const masyarakatNotifications = [
    {
      id: 'm-1',
      title: 'Peringatan Cuaca',
      message: 'Curah hujan tinggi diperkirakan terjadi sore ini di wilayah Anda.',
      time: '5 menit lalu',
      read: false
    },
    {
      id: 'm-2',
      title: 'Laporan Diterima',
      message: 'Laporan Anda sedang menunggu validasi tim TRC.',
      time: '20 menit lalu',
      read: true
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
            roleClassName="text-red-600"
            avatarClassName="bg-red-600 text-white"
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