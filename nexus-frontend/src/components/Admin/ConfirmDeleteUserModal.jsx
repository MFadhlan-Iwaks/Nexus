import { AlertTriangle, Loader2, Trash2, UserX, X } from 'lucide-react';

export default function ConfirmDeleteUserModal({ isOpen, user, loading = false, onCancel, onConfirm }) {
  if (!isOpen || !user) return null;

  const nama = user.nama || user.name || '-';
  const role = user.role || '-';
  const wilayah = user.wilayah || user.region || '-';

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-200">Konfirmasi Penghapusan</p>
            <h3 className="font-bold flex items-center gap-2 mt-1">
              <UserX size={18} className="text-red-300" />
              Hapus Pengguna Sistem
            </h3>
            <p className="text-xs text-slate-200 mt-1">
              Aksi ini akan menghapus akun, sementara data historis tetap dipertahankan.
            </p>
          </div>
          <button onClick={onCancel} disabled={loading} className="text-slate-300 hover:text-white disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Akun akan dihapus permanen.</p>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Referensi pada laporan, validasi, logistik, faskes, dan broadcast akan dilepas dari akun ini.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Pengguna</p>
            <p className="font-bold text-slate-900 mt-1">{nama}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-200 px-2 py-1 font-semibold capitalize text-slate-700">
                {role}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                {wilayah}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            {loading ? 'Menghapus...' : 'Hapus User'}
          </button>
        </div>
      </div>
    </div>
  );
}
