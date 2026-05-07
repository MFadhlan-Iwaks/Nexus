'use client';



import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import NavbarMasyarakat from '@/components/masyarakat/NavbarMasyarakat';
import EmergencyCTA from '@/components/masyarakat/EmergencyCTA';
import BroadcastBanner from '@/components/masyarakat/BroadcastBanner';
import RiwayatLaporan from '@/components/masyarakat/RiwayatLaporan';
import { LoadingState } from '@/components/common/PageStates';

export default function DashboardMasyarakatPage() {
  const router = useRouter();
  const userSnapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => localStorage.getItem('user') || '',
    () => null
  );

  const user = useMemo(() => {
    if (!userSnapshot) return null;
    try {
      return JSON.parse(userSnapshot);
    } catch {
      return null;
    }
  }, [userSnapshot]);

  const role = String(user?.role || '').toLowerCase();
  const redirectTarget = role === 'admin'
    ? '/admin/dashboard'
    : role === 'operator'
      ? '/operator/dashboard'
      : role === 'trc'
        ? '/trc/dashboard'
        : '/auth';

  useEffect(() => {
    if (userSnapshot === null) return;

    if (!user) {
      document.cookie = 'role=; Max-Age=0; path=/; samesite=lax';
      document.cookie = 'token=; Max-Age=0; path=/; samesite=lax';
      router.replace('/auth');
      return;
    }

    if (role !== 'masyarakat') {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, role, router, user, userSnapshot]);

  if (userSnapshot === null) {
    return <LoadingState message="Memeriksa akses..." />;
  }

  if (!user || role !== 'masyarakat') {
    return <LoadingState message="Mengalihkan..." />;
  }

  return <DashboardMasyarakatContent user={user} />;
}

function DashboardMasyarakatContent({ user }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <NavbarMasyarakat userName={user?.nama} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        <EmergencyCTA />

        
        <BroadcastBanner />

        
        <RiwayatLaporan />
      </main>
    </div>
  );
}
