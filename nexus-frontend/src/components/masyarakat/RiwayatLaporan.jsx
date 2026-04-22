'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';

export default function RiwayatLaporan() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/laporan/riwayat', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await res.json();
        if (res.ok) {
          setRiwayat(result.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data riwayat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  // Fungsi untuk mengubah warna badge secara otomatis berdasarkan status
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium px-2 py-1 rounded-md">
            <Clock size={12} /> Menunggu Validasi TRC
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2 py-1 rounded-md">
            <AlertCircle size={12} /> Sedang Ditangani
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-2 py-1 rounded-md">
            <CheckCircle2 size={12} /> Tervalidasi (Selesai)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded-md">
            {status}
          </span>
        );
    }
  };

  // Fungsi untuk merapikan format waktu dari PostgreSQL
  const formatWaktu = (waktu) => {
    const date = new Date(waktu);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date) + ' WIB';
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-700">Riwayat Laporan Anda</h3>
        <button className="text-sm text-red-600 font-medium hover:underline">Lihat Semua</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          // Tampilan saat sedang loading (Skeleton Loader sederhana)
          <div className="flex items-center justify-center p-8 bg-white border border-slate-200 rounded-xl">
            <Loader2 className="animate-spin text-red-500" size={24} />
            <span className="ml-2 text-slate-500 text-sm">Memuat data...</span>
          </div>
        ) : riwayat.length === 0 ? (
          // Tampilan jika user belum pernah melapor sama sekali
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">Belum ada laporan yang Anda buat.</p>
          </div>
        ) : (
          // Looping data dari backend untuk dirender menjadi list HTML
          riwayat.map((laporan) => (
            <div key={laporan.id_laporan} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg text-slate-500 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors">
                    {laporan.kategori_bencana}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatWaktu(laporan.waktu_laporan)}
                    </span>
                  </div>
                  {renderStatusBadge(laporan.status)}
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-red-600" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}