'use client';



import { useMemo, useState } from 'react';
import { MapPin, Clock, ChevronRight, FileText, ImageIcon, X, ShieldCheck, Activity } from 'lucide-react';
import { getRiwayatMasyarakat } from '@/services/reportService';
import { formatWaktu, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { LoadingState, ErrorState, EmptyState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';

export default function RiwayatLaporan() {
  const { data: riwayat, loading, error, refetch } = useAsync(getRiwayatMasyarakat);
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-slate-700">Riwayat Laporan Anda</h3>
      </div>

      <div className="space-y-3">
        {loading && <LoadingState />}

        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && riwayat?.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="Belum Ada Laporan"
            description="Anda belum pernah membuat laporan. Tekan tombol merah di atas untuk mulai melapor."
          />
        )}

        {!loading && !error && riwayat?.map((laporan) => (
          <button
            type="button"
            key={laporan.id_laporan}
            onClick={() => setSelectedReport(laporan)}
            className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="bg-slate-100 p-3 rounded-lg text-slate-500 shrink-0">
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-red-600 transition-colors truncate">
                  {laporan.kategori_bencana}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Clock size={12} />
                  <span>{formatWaktu(laporan.waktu_laporan)}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${getStatusBadgeClass(laporan.status)}`}>
                  {getStatusLabel(laporan.status)}
                </span>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-400 group-hover:text-red-600 shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </section>
  );
}

function ReportDetailModal({ report, onClose }) {
  const baseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+api\/?$/, ''),
    []
  );
  const imageUrl = (fileName) => fileName ? `${baseUrl}/uploads/${fileName}` : null;
  const buktiVisual = imageUrl(report.bukti_visual);
  const fotoValidasi = imageUrl(report.foto_validasi);
  const fotoProgress = imageUrl(report.foto_progress);
  const hasCoordinate = report.latitude !== null && report.latitude !== undefined
    && report.longitude !== null && report.longitude !== undefined;
  const mapsUrl = hasCoordinate ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}` : null;

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-linear-to-r from-slate-900 via-slate-800 to-red-900 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-200">Detail Laporan</p>
            <div className="flex items-center gap-2 font-bold mt-1">
              <FileText size={20} className="text-red-300" />
              {report.kategori_bencana || 'Laporan Bencana'}
            </div>
            <p className="text-xs text-slate-200 mt-1">{formatWaktu(report.waktu_laporan)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${getStatusBadgeClass(report.status)}`}>
              {getStatusLabel(report.status)}
            </span>
            <span className="text-xs font-mono text-slate-400">ID #{report.id_laporan}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoTile label="Kategori" value={report.kategori_bencana || '-'} />
            <InfoTile label="Waktu Lapor" value={formatWaktu(report.waktu_laporan)} />
            <InfoTile label="Fase Penanganan" value={report.fase_penanganan || 'Menunggu validasi petugas'} />
            <InfoTile label="Skala Darurat" value={report.skala_darurat || 'Belum ditentukan'} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Kejadian</p>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {report.deskripsi_kejadian || 'Tidak ada deskripsi.'}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-1">
              <ShieldCheck size={14} /> Validasi & Update Petugas
            </p>
            <div className="space-y-3 text-sm">
              <DetailRow label="Petugas TRC" value={report.nama_trc || 'Belum ditugaskan'} />
              <DetailRow label="Waktu Validasi" value={report.waktu_validasi ? formatWaktu(report.waktu_validasi) : 'Belum divalidasi'} />
              <DetailRow label="Catatan Validasi" value={report.keterangan_validasi || '-'} />
              <DetailRow label="Update Terakhir" value={report.pesan_situasi || '-'} />
              <DetailRow label="Waktu Update" value={report.waktu_update ? formatWaktu(report.waktu_update) : '-'} />
            </div>
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 hover:border-red-200 hover:text-red-700"
            >
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Lokasi laporan: {report.latitude}, {report.longitude}
              </span>
              <ChevronRight size={18} />
            </a>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ImageIcon size={14} /> Bukti Visual
            </p>
            {buktiVisual ? (
              <a href={buktiVisual} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img src={buktiVisual} alt="Bukti visual laporan" className="max-h-72 w-full object-contain" />
              </a>
            ) : (
              <p className="text-sm text-slate-500">Tidak ada bukti visual yang dilampirkan.</p>
            )}
          </div>

          {(fotoValidasi || fotoProgress) && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Activity size={14} /> Dokumentasi Penanganan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EvidenceImage title="Foto Validasi" url={fotoValidasi} />
                <EvidenceImage title="Foto Progress" url={fotoProgress} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">{label}</p>
      <p className="mt-0.5 text-sm text-blue-950 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function EvidenceImage({ title, url }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-slate-600">{title}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={url} alt={title} className="max-h-52 w-full object-contain" />
        </a>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Belum tersedia.
        </div>
      )}
    </div>
  );
}
