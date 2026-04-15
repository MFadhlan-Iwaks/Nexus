import NavbarRelawan from '@/components/relawan/NavbarRelawan';
import EmergencyCTA from '@/components/relawan/EmergencyCTA';
import BroadcastBanner from '@/components/relawan/BroadcastBanner';
import RiwayatLaporan from '@/components/relawan/RiwayatLaporan';

export default function DashboardRelawanPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      
      <NavbarRelawan />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <EmergencyCTA />

        <BroadcastBanner />

        <RiwayatLaporan />
      </main>

    </div>
  );
}