import NavbarMasyrakat from '@/components/masyrakat/NavbarMasyrakat';
import EmergencyCTA from '@/components/masyrakat/EmergencyCTA';
import BroadcastBanner from '@/components/masyrakat/BroadcastBanner';
import RiwayatLaporan from '@/components/masyrakat/RiwayatLaporan';

export default function DashboardMasyrakatPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <NavbarMasyrakat />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <EmergencyCTA />

        <BroadcastBanner />

        <RiwayatLaporan />
      </main>
    </div>
  );
}
