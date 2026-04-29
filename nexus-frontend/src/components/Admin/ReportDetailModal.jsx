"use client";

// src/components/Admin/ReportDetailModal.jsx
// Modal detail laporan — kompatibel dengan struktur data mockData.js

import React from 'react';
import { X, Megaphone, CheckCircle2, XCircle } from 'lucide-react';
import { formatWaktu, getSkalaClass, getStatusLabel } from '@/lib/utils';

export default function ReportDetailModal({ report, onClose, onCreateBroadcast, onValidation }) {
  if (!report) return null;

  // Support field name lama (name/contact/submitted_at/bukti_visual) dan baru (nama/waktu_lapor/foto)
  const m = report.masyarakat || {};
  const t = report.trc || {};

  const pelapor = m.nama || m.name || '-';
  const kontak = m.contact || '-';
  const kategori = m.kategori || '-';
  const deskripsi = m.deskripsi || '-';
  const waktuLapor = m.waktu_lapor || m.submitted_at;
  const fotoBukti = m.foto || m.bukti_visual;
  const lat = m.latitude;
  const lng = m.longitude;

  const petugas = t.petugas || t.name || '-';
  const trcId = t.id || '-';
  const statusValidasi = t.status_validasi || '-';
  const skala = t.skala_kedaruratan || '-';
  const fasePenanganan = t.fase_penanganan || '-';
  const catatan = t.catatan || '-';
  const waktuValidasi = t.waktu_validasi || t.validated_at;
  const fotoBuktiTrc = t.foto_bukti || t.foto_bukti_validasi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 z-10 overflow-y-auto max-h-[90vh] mx-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{report.id}</h3>
            <p className="text-xs text-slate-500">
              Status: <span className="font-semibold">{getStatusLabel(report.status)}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* === DATA MASYARAKAT === */}
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3 text-sm">📋 Data dari Masyarakat</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              <div><span className="font-semibold">Pelapor:</span> {pelapor}</div>
              <div><span className="font-semibold">Kontak:</span> {kontak}</div>
              <div><span className="font-semibold">Jenis Bencana:</span> {kategori}</div>
              <div><span className="font-semibold">Waktu Laporan:</span> {formatWaktu(waktuLapor)}</div>
              {lat && lng && (
                <div className="sm:col-span-2">
                  <span className="font-semibold">Koordinat:</span> {lat?.toFixed(6)}, {lng?.toFixed(6)}
                </div>
              )}
              {deskripsi && (
                <div className="sm:col-span-2">
                  <span className="font-semibold">Deskripsi:</span>
                  <div className="mt-1 bg-white p-3 rounded border border-blue-100 text-xs leading-relaxed">{deskripsi}</div>
                </div>
              )}
              {fotoBukti && (
                <div className="sm:col-span-2">
                  <span className="font-semibold">Foto Bukti:</span>
                  <img src={fotoBukti} alt="bukti-visual" className="mt-2 w-48 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>
          </div>

          {/* === DATA TRC === */}
          {report.trc && (
            <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
              <h4 className="font-bold text-emerald-900 mb-3 text-sm">✓ Data dari TRC (Validasi)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                <div><span className="font-semibold">Petugas TRC:</span> {petugas} ({trcId})</div>
                <div>
                  <span className="font-semibold">Status Validasi:</span>{' '}
                  <span className={`font-bold ${statusValidasi === 'valid' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {statusValidasi.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Skala Kedaruratan:</span>{' '}
                  <span className={`font-bold ${getSkalaClass(skala)}`}>{skala.toUpperCase()}</span>
                </div>
                <div><span className="font-semibold">Fase:</span> {fasePenanganan}</div>
                <div><span className="font-semibold">Waktu Validasi:</span> {formatWaktu(waktuValidasi)}</div>
                {catatan && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold">Catatan:</span>
                    <div className="mt-1 bg-white p-3 rounded border border-emerald-100 text-xs">{catatan}</div>
                  </div>
                )}
                {fotoBuktiTrc && (
                  <div className="sm:col-span-2">
                    <span className="font-semibold">Foto Bukti Validasi:</span>
                    <img src={fotoBuktiTrc} alt="bukti-validasi" className="mt-2 w-48 h-32 object-cover rounded-lg border" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200">
            Tutup
          </button>
          {report.status === 'menunggu_admin' && onValidation && (
            <>
              <button
                onClick={() => onValidation(report.id, 'tolak')}
                className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-red-100"
              >
                <XCircle size={16} /> Tolak
              </button>
              <button
                onClick={() => onValidation(report.id, 'validasi')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Setujui & Proses
              </button>
            </>
          )}
          {onCreateBroadcast && (
            <button
              onClick={() => onCreateBroadcast(report)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2 font-medium text-sm"
            >
              <Megaphone size={16} /> Buat Broadcast
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
