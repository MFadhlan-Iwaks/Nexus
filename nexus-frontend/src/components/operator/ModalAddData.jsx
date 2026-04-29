import { X, Building2, Package, Plus, Sparkles, ClipboardList } from 'lucide-react';

export default function ModalAddData({ isOpen, onClose, activeTab, onSave }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const payload = {
      nama: formData.get('nama')?.toString().trim() || '',
      kategori: formData.get('kategori')?.toString().trim() || '',
      stok: Number(formData.get('stok') || 0),
      unit: formData.get('unit')?.toString().trim() || '',
    };

    if ((activeTab === 'logistik' || activeTab === 'faskes') && onSave) {
      onSave(payload);
      return;
    }

    alert(`Data ${activeTab === 'faskes' ? 'Fasilitas Kesehatan' : 'Logistik'} baru berhasil ditambahkan!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-blue-200">Input Data Instansi</p>
            <div className="flex items-center gap-2 font-bold mt-1">
              {activeTab === 'faskes' ? <Building2 size={20} className="text-blue-300" /> : <Package size={20} className="text-blue-300" />}
              Tambah Data {activeTab === 'faskes' ? 'Faskes' : 'Logistik'} Baru
            </div>
            <p className="text-xs text-slate-200 mt-1">Lengkapi data penting agar sinkronisasi pusat tetap akurat.</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex items-start gap-3">
            <Sparkles size={16} className="text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-800">
              {activeTab === 'faskes'
                ? 'Masukkan hanya kapasitas layanan kesehatan. Stok barang medis dikelola di menu Logistik.'
                : 'Gunakan nama item yang spesifik dan satuan konsisten agar status stok otomatis terbaca dengan benar.'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              {activeTab === 'faskes' ? 'Nama Ruangan / Unit' : 'Nama Barang / Bantuan'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="nama"
              required
              placeholder={activeTab === 'faskes' ? "Cth: RSUD dr. Soekardjo (IGD)" : "Cth: Kantong Darah O+, Masker N95"}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select name="kategori" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" required>
                {activeTab === 'faskes' ? (
                  <>
                    <option value="">-- Pilih Kategori Faskes --</option>
                    <option value="Ruang Darurat (IGD)">Ruang Darurat (IGD)</option>
                    <option value="Rawat Inap">Rawat Inap</option>
                    <option value="ICU">ICU</option>
                    <option value="Ruang Isolasi">Ruang Isolasi</option>
                    <option value="Ruang Observasi">Ruang Observasi</option>
                    <option value="Ruang Darurat">Ruang Darurat</option>
                    <option value="Kamar Perawatan">Kamar Perawatan</option>
                  </>
                ) : (
                  <>
                    <option value="">-- Pilih Kategori Logistik --</option>
                    <option value="Logistik Pangan">Logistik Pangan (Makanan/Minuman)</option>
                    <option value="Sandang & Selimut">Sandang & Selimut</option>
                    <option value="Peralatan Darurat">Peralatan Darurat (Tenda, Perahu)</option>
                    <option value="Medis">Medis (Darah, Obat, Masker, APD, Infus, Oksigen)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Satuan (Unit) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="unit"
                required
                placeholder={activeTab === 'faskes' ? 'Cth: Bed, Ruang' : 'Cth: Kg, Box, Kantong'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {activeTab === 'faskes' ? 'Kapasitas Tersedia' : 'Stok Awal'} <span className="text-red-500">*</span>
              </label>
              <input name="stok" type="number" required min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><ClipboardList size={13} /> Catatan Input</p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeTab === 'faskes'
                  ? 'Data yang disimpan akan masuk daftar kapasitas layanan faskes dan memakai status Tersedia, Hampir Penuh, atau Penuh.'
                  : 'Data yang disimpan akan langsung masuk daftar logistik dan tercatat pada riwayat pembaruan stok.'}
              </p>
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
