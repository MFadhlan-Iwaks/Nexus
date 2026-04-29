"use client";

// src/components/masyarakat/NavbarMasyarakat.jsx

import { ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/masyarakat/NotificationBell';
import UserProfileDropdown from '@/components/masyarakat/UserProfileDropdown';
import { mockMasyarakatNotifications } from '@/data/mockData';
import { clearSession } from '@/services/authService';

export default function NavbarMasyarakat({ userName }) {
  const router = useRouter();

  const masyarakatProfile = {
    nama: userName || 'Masyarakat',
    role: 'Masyarakat',
    id: 'MYS-XXX',
    no_hp: '-',
    email: '-',
    alamat: '-',
    instansi: 'Warga',
  };

  const handleLogout = () => {
    clearSession();
    router.push('/');
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
          <NotificationBell items={mockMasyarakatNotifications} />
          <div className="h-8 w-px bg-slate-200" />
          <UserProfileDropdown
            defaultProfile={masyarakatProfile}
            roleClassName="text-red-600"
            avatarClassName="bg-red-600 text-white"
          />
          <button
            onClick={handleLogout}
            className="ml-1 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
            title="Keluar dari sistem"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}