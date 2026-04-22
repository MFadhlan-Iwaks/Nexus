'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, BellRing, Info } from 'lucide-react';

export default function BroadcastBanner() {
  const [peringatan, setPeringatan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeringatan = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/peringatan', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await res.json();
        if (res.ok) {
          setPeringatan(result.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data peringatan dini:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeringatan();
  }, []);

  // Fungsi untuk membuat waktu menjadi "10 mnt yang lalu" dsb
  const getWaktuRelatif = (waktu) => {
    // Pastikan format waktunya valid sebelum dihitung
    if (!waktu) return '';
    
    const waktuPeringatan = new Date(waktu).getTime();
    const sekarang = new Date().getTime();
    const selisihMenit = Math.floor((sekarang - waktuPeringatan) / 60000);

    if (selisihMenit < 1) return 'Baru saja';
    if (selisihMenit < 60) return `${selisihMenit} mnt yang lalu`;
    
    const selisihJam = Math.floor(selisihMenit / 60);
    if (selisihJam < 24) return `${selisihJam} jam yang lalu`;
    
    return new Date(waktu).toLocaleDateString('id-ID');
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-1">
        <BellRing size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-700">Peringatan Dini Terbaru</h3>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-sm text-slate-500 py-4">Memeriksa pembaruan sistem...</div>
        ) : peringatan.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 text-slate-500 text-sm">
            <Info size={18} /> Tidak ada peringatan dini saat ini. Kondisi aman.
          </div>
        ) : (
          peringatan.map((item) => (
            <div key={item.id_peringatan} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm transition-all hover:shadow-md">
              <div className="bg-amber-100 text-amber-600 p-2 rounded-full shrink-0 mt-1">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    INFO DARURAT
                  </span>
                  <span className="text-xs text-amber-600 font-medium">
                    {/* Menggunakan waktu_kirim sesuai database */}
                    {getWaktuRelatif(item.waktu_kirim)}
                  </span>
                </div>
                {/* Menggunakan pesan_peringatan sesuai database */}
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {item.pesan_peringatan}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}