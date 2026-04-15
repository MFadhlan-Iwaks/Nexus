import { X, RefreshCw } from 'lucide-react';

export default function ModalUpdateData({ isOpen, onClose, selectedItem }) {
  if (!isOpen || !selectedItem) return null;

  const handleSave = (e) => {
    e.preventDefault();
    alert(`Data ${selectedItem.nama} berhasil diperbarui ke sistem pusat NEXUS!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw size={18} className="text-blue-600" />
            Update {selectedItem.tipe === 'faskes' ? 'Kapasitas' : 'Stok Logistik'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20}/>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Target</label>
            <p className="font-bold text-slate-800 text-lg">{selectedItem.nama}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Masukkan Angka Terbaru (Update ke Pusat)
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                defaultValue={selectedItem.current}
                className="w-full text-2xl font-bold px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-slate-500 font-medium w-20">{selectedItem.unit}</span>
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