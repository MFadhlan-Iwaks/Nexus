'use client';

// src/app/masyarakat/dashboard/page.js
// Dashboard utama masyarakat — menampilkan peringatan dini dan riwayat laporan.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarMasyarakat from '@/components/masyarakat/NavbarMasyarakat';
import EmergencyCTA from '@/components/masyarakat/EmergencyCTA';
import BroadcastBanner from '@/components/masyarakat/BroadcastBanner';
import RiwayatLaporan from '@/components/masyarakat/RiwayatLaporan';
import { getLocalUser } from '@/services/authService';

export default function DashboardMasyarakatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = getLocalUser();
    if (localUser) {
      setUser(localUser);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <NavbarMasyarakat userName={user?.nama} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tombol darurat laporan */}
        <EmergencyCTA />

        {/* Banner peringatan dini dari Admin */}
        <BroadcastBanner />

        {/* Riwayat laporan milik user */}
        <RiwayatLaporan />
      </main>
    </div>
  );
}
