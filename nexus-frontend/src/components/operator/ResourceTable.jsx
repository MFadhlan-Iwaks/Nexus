import { Search, Plus, Edit } from 'lucide-react';

export default function ResourceTable({ activeTab, onAdd, onUpdate }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Cari data ${activeTab}...`} 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <button 
          onClick={onAdd} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={16} /> Tambah Data Baru
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <th className="p-4 font-semibold">Nama / Kategori</th>
            <th className="p-4 font-semibold">Sisa Kapasitas/Stok</th>
            <th className="p-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          
          {activeTab === 'faskes' && (
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-800">
                RSUD dr. Soekardjo<br/>
                <span className="text-xs font-normal text-slate-500">Kamar IGD</span>
              </td>
              <td className="p-4 font-bold text-red-600 text-lg">
                5 <span className="text-sm font-normal text-slate-500">Bed</span>
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onUpdate({tipe: 'faskes', nama: 'RSUD dr. Soekardjo (IGD)', unit: 'Bed', current: 5})} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 ml-auto"
                >
                  <Edit size={16}/> Perbarui
                </button>
              </td>
            </tr>
          )}

          {activeTab === 'logistik' && (
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-800">
                Beras Premium<br/>
                <span className="text-xs font-normal text-slate-500">Logistik Pangan</span>
              </td>
              <td className="p-4 font-bold text-slate-800 text-lg">
                2500 <span className="text-sm font-normal text-slate-500">Kg</span>
              </td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => onUpdate({tipe: 'logistik', nama: 'Beras Premium', unit: 'Kg', current: 2500})} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end gap-1 ml-auto"
                >
                  <Edit size={16}/> Perbarui
                </button>
              </td>
            </tr>
          )}

        </tbody>
      </table>
    </div>
  );
}