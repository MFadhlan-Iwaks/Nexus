import { X, RefreshCw, ShieldCheck, AlertTriangle, OctagonX } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ModalUpdateData({ isOpen, onClose, selectedItem, onSave }) {
  const [latestStock, setLatestStock] = useState(0);
  const isFaskes = selectedItem?.tipe === 'faskes';

  useEffect(() => {
    if (selectedItem) {
      setLatestStock(Number(selectedItem.current || 0));
    }
  }, [selectedItem]);

  const liveStatus = isFaskes
    ? latestStock <= 0 ? 'Penuh' : latestStock <= 5 ? 'Hampir Penuh' : 'Tersedia'
    : latestStock <= 0 ? 'Habis' : latestStock <= 100 ? 'Menipis' : 'Aman';

  const getStatusStyle = (status) => {
    if (status === 'Habis') return 'bg-red-50 border-red-200 text-red-700';
    if (status === 'Menipis') return 'bg-amber-50 border-amber-200 text-amber-700';
    if (status === 'Penuh') return 'bg-red-50 border-red-200 text-red-700';
    if (status === 'Hampir Penuh') return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  const StatusIcon = liveStatus === 'Habis' || liveStatus === 'Penuh' ? OctagonX : liveStatus === 'Menipis' || liveStatus === 'Hampir Penuh' ? AlertTriangle : ShieldCheck;

  if (!isOpen || !selectedItem) return null;

  const handleSave = (e) => {
    e.preventDefault();

    if (onSave) {
      onSave({ id: selectedItem.id, newStock: latestStock, tipe: selectedItem.tipe });
      return;
    }

    alert(`Data ${selectedItem.nama} berhasil diperbarui ke sistem pusat NEXUS!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-200">Update Cepat</p>
            <h3 className="font-bold flex items-center gap-2 mt-1">
              <RefreshCw size={18} className="text-blue-300" />
              Update {isFaskes ? 'Kapasitas Faskes' : 'Stok Logistik'}
            </h3>
            <p className="text-xs text-slate-200 mt-1">
              Perubahan akan langsung tersimpan sebagai riwayat pembaruan {isFaskes ? 'kapasitas' : 'stok'}.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Target</label>
            <p className="font-bold text-slate-800 text-lg">{selectedItem.nama}</p>
          </div>

          <div className={`rounded-xl border p-3 flex items-center justify-between ${getStatusStyle(liveStatus)}`}>
            <p className="text-xs font-semibold">Status {isFaskes ? 'kapasitas' : 'stok'} setelah update</p>
            <p className="text-sm font-bold flex items-center gap-1.5">
              <StatusIcon size={16} /> {liveStatus}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Masukkan Angka Terbaru ({isFaskes ? 'Kapasitas Tersedia' : 'Update ke Pusat'})
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={latestStock}
                onChange={(e) => setLatestStock(Number(e.target.value))}
                className="w-full text-2xl font-bold px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-slate-500 font-medium w-20 text-center">{selectedItem.unit}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Perubahan angka ini akan langsung disinkronisasi ke Executive Dashboard BPBD.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-colors">
              Simpan & Sinkronkan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
