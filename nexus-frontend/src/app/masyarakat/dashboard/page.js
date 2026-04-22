import NavbarMasyarakat from '@/components/masyarakat/NavbarMasyarakat';
import EmergencyCTA from '@/components/masyarakat/EmergencyCTA';
import BroadcastBanner from '@/components/masyarakat/BroadcastBanner';
import RiwayatLaporan from '@/components/masyarakat/RiwayatLaporan';

export default function DashboardMasyarakatPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <NavbarMasyarakat />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <EmergencyCTA />

        <BroadcastBanner />

        <RiwayatLaporan />
      </main>
    </div>
  );
}
