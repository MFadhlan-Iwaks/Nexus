// src/components/Admin/MonitoringTRC.jsx
// Tabel monitoring petugas TRC — kompatibel dengan mockTrcUnits

import { Activity, User, FileText, MapPin } from 'lucide-react';
import { formatWaktuRelatif } from '@/lib/utils';
import { EmptyState } from '@/components/common/PageStates';

export default function MonitoringTRC({ trcMembers = [], reports = [] }) {
  const getCurrentReport = (reportId) => reports.find((r) => r.id === reportId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300 flex flex-col h-full p-6">
      <div className="mb-6">
        <h2 className="font-bold text-slate-800 text-lg">Monitoring Petugas TRC</h2>
        <p className="text-xs text-slate-500">
          Pantau status aktif/tidak aktif dan laporan yang sedang ditangani oleh petugas TRC.
        </p>
      </div>

      {trcMembers.length === 0 ? (
        <EmptyState title="Tidak Ada Data TRC" description="Belum ada unit TRC yang terdaftar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-semibold">Petugas</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Fase / Laporan Aktif</th>
                <th className="p-4 font-semibold">Lokasi Terakhir</th>
                <th className="p-4 font-semibold">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {trcMembers.map((member) => {
                // Support field lama (currentReportId, name) dan baru (laporan_aktif_id, nama)
                const reportId = member.laporan_aktif_id || member.currentReportId;
                const namaAnggota = member.nama || member.name || '-';
                const currentReport = reportId ? getCurrentReport(reportId) : null;

                return (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        <User size={15} /> {namaAnggota}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">{member.id}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        member.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Activity size={10} className={member.status === 'aktif' ? 'animate-pulse' : ''} />
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {currentReport ? (
                        <div>
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <FileText size={14} /> {currentReport.id} — {currentReport.masyarakat?.kategori || '-'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {member.fase || currentReport.trc?.fase_penanganan || '-'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-slate-400">Tidak ada laporan aktif</span>
                          {member.progres_terakhir && (
                            <p className="text-xs text-slate-400 mt-0.5 italic">{member.progres_terakhir}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {member.lokasi_terakhir ? (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin size={12} className="text-red-400" /> {member.lokasi_terakhir}
                        </span>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {formatWaktuRelatif(member.waktu_update)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
