import { X, Building2, Package, Plus } from 'lucide-react';

export default function ModalAddData({ isOpen, onClose, activeTab }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Data ${activeTab === 'faskes' ? 'Fasilitas Kesehatan' : 'Logistik'} baru berhasil ditambahkan!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            {activeTab === 'faskes' ? <Building2 size={20} className="text-blue-600" /> : <Package size={20} className="text-blue-600" />}
            Tambah Data {activeTab === 'faskes' ? 'Faskes' : 'Logistik'} Baru
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Nama {activeTab === 'faskes' ? 'Fasilitas / Ruangan' : 'Barang / Bantuan'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder={activeTab === 'faskes' ? "Cth: RSUD dr. Soekardjo (IGD)" : "Cth: Beras Premium 5kg"}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
              {activeTab === 'faskes' ? (
                <>
                  <option value="">-- Pilih Kategori Faskes --</option>
                  <option value="igd">Ruang Darurat (IGD)</option>
                  <option value="rawat_inap">Kamar Rawat Inap</option>
                  <option value="kantong_darah">Stok Kantong Darah</option>
                </>
              ) : (
                <>
                  <option value="">-- Pilih Kategori Logistik --</option>
                  <option value="pangan">Logistik Pangan (Makanan/Minuman)</option>
                  <option value="sandang">Sandang & Selimut</option>
                  <option value="peralatan">Peralatan Darurat (Tenda, Perahu)</option>
                  <option value="obat">Obat-obatan</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Kapasitas / Stok Awal <span className="text-red-500">*</span>
              </label>
              <input type="number" required min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Satuan (Unit) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder={activeTab === 'faskes' ? "Cth: Bed, Kantong" : "Cth: Kg, Box, Unit"}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
              Batal
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Plus size={18} /> Simpan Data
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}