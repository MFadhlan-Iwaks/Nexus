import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, item, resourceType, loading = false, onCancel, onConfirm }) {
  if (!isOpen || !item) return null;

  const isFaskes = resourceType === 'faskes';
  const label = isFaskes ? 'faskes' : 'logistik';
  const detailLabel = isFaskes ? 'kapasitas layanan' : 'stok barang';

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-red-200">Konfirmasi Penghapusan</p>
            <h3 className="font-bold flex items-center gap-2 mt-1">
              <Trash2 size={18} className="text-red-300" />
              Hapus Data {isFaskes ? 'Faskes' : 'Logistik'}
            </h3>
            <p className="text-xs text-slate-200 mt-1">
              Pastikan data yang dipilih sudah benar sebelum dihapus dari sistem.
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
              <p className="text-sm font-bold text-red-800">Data akan dihapus permanen.</p>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Item {label} ini akan hilang dari daftar {detailLabel} operator dan dashboard terkait.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Data</p>
            <p className="font-bold text-slate-900 mt-1">{item.nama}</p>
            <p className="text-sm text-slate-500 mt-1">
              {item.kategori || 'Tanpa kategori'} • {item.stok ?? 0} {item.unit || 'Unit'}
            </p>
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
            {loading ? 'Menghapus...' : 'Hapus Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
