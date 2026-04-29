"use client";

// src/components/trc/TRCNavbar.jsx

import { ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationBell from '@/components/common/NotificationBell';
import { mockTrcNotifications, mockTrcProfile } from '@/data/mockData';
import { clearSession } from '@/services/authService';

export default function TRCNavbar({ profile }) {
  const router = useRouter();

  // Gunakan prop profile jika ada, fallback ke mock
  const activeProfile = profile || mockTrcProfile;

  const handleLogout = () => {
    clearSession();
    router.push('/');
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
          <NotificationBell items={mockTrcNotifications} />
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <UserProfileDropdown
            defaultProfile={activeProfile}
            roleClassName="text-slate-500"
            avatarClassName="bg-slate-100 text-slate-600"
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