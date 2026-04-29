import { Clock, ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function HistoryTable({ entries = [], activeInstitution }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => q === '' || e.itemName.toLowerCase().includes(q) || e.operator.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200 bg-slate-50 md:flex md:items-center md:justify-between">
        <div>
          <h3 className="font-bold text-slate-800">Catatan Aktivitas {activeInstitution || 'Instansi'}</h3>
          {activeInstitution && <p className="text-xs text-slate-500 mt-1">Menampilkan riwayat untuk {activeInstitution}.</p>}
        </div>
        <div className="mt-3 md:mt-0 w-full md:w-72 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm" placeholder="Cari riwayat (nama item atau operator)..." />
        </div>
      </div>

      <table className="w-full text-left">
        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
          {filtered.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50">
              <td className="p-4 w-48">
                <div className="flex items-center gap-2 text-xs">
                  <Clock size={14} /> {entry.time}
                </div>
              </td>
              <td className="p-4">
                <span className="font-bold text-slate-800">{entry.operator}</span>{' '}
                {entry.action === 'add'
                  ? `menambahkan data ${entry.resourceType === 'faskes' ? 'faskes' : 'logistik'}`
                  : `memperbarui ${entry.resourceType === 'faskes' ? 'kapasitas' : 'stok'}`}{' '}
                <strong>{entry.itemName}</strong>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  {entry.action === 'add' ? (
                    <span className="text-blue-600 font-bold">
                      Stok awal {entry.newStock} {entry.unit}
                    </span>
                  ) : (
                    <>
                      <span className="line-through">{entry.previousStock} {entry.unit}</span>
                      <ArrowRight size={12} />
                      <span className="text-blue-600 font-bold">{entry.newStock} {entry.unit}</span>
                    </>
                  )}
                </div>
              </td>
              <td className="p-4 text-right">
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">{entry.status}</span>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="p-6 text-center text-slate-500 text-sm">
                Belum ada riwayat pembaruan yang cocok.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}