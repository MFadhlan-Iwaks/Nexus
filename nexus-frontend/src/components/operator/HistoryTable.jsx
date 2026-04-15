import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HistoryTable() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-800">Catatan Aktivitas Instansi</h3>
      </div>
      <table className="w-full text-left">
        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
          <tr className="hover:bg-slate-50">
            <td className="p-4 w-48"><div className="flex items-center gap-2 text-xs"><Clock size={14} /> 10:45 WIB</div></td>
            <td className="p-4">
              <span className="font-bold text-slate-800">Angga N.</span> memperbarui stok <strong>Beras Premium</strong>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="line-through">3000 Kg</span> <ArrowRight size={12}/> <span className="text-blue-600 font-bold">2500 Kg</span>
              </div>
            </td>
            <td className="p-4 text-right"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Sukses</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}