"use client"; 

import { useRouter } from 'next/navigation';
import { ShieldAlert, PlusCircle } from 'lucide-react';

export default function EmergencyCTA() {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
        <ShieldAlert size={200} />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-2">Ada Kondisi Darurat?</h2>
        <p className="text-red-100 text-sm mb-6 max-w-sm">
          Segera laporkan kejadian bencana di sekitar Anda. Pastikan lokasi GPS dan kamera Anda aktif.
        </p>
        
        <button 
          onClick={() => router.push('/relawan/lapor')} 
          className="w-full sm:w-auto bg-white text-red-600 hover:bg-slate-50 font-bold py-3 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform transform active:scale-95"
        >
          <PlusCircle size={22} />
          BUAT LAPORAN SEKARANG
        </button>
      </div>
    </section>
  );
}