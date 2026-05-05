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
import { LoadingState } from '@/components/common/PageStates';

export default function DashboardMasyarakatPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = getLocalUser();
    const role = String(localUser?.role || '').toLowerCase();
    if (!localUser) {
      document.cookie = 'role=; Max-Age=0; path=/; samesite=lax';
      document.cookie = 'token=; Max-Age=0; path=/; samesite=lax';
      setIsAuthorized(false);
      router.replace('/auth');
      return;
    }
    if (role !== 'masyarakat') {
      const target = role === 'admin'
        ? '/admin/dashboard'
        : role === 'operator'
          ? '/operator/dashboard'
          : role === 'trc'
            ? '/trc/dashboard'
            : '/auth';
      setIsAuthorized(false);
      router.replace(target);
      return;
    }
    setUser(localUser);
    setIsAuthorized(true);
  }, [router]);

  if (isAuthorized === null) {
    return <LoadingState message="Memeriksa akses..." />;
  }

  if (isAuthorized === false) {
    return <LoadingState message="Mengalihkan..." />;
  }

  return <DashboardMasyarakatContent user={user} />;
}

function DashboardMasyarakatContent({ user }) {
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
