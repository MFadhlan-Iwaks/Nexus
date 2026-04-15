import { AlertTriangle, BellRing } from 'lucide-react';

export default function BroadcastBanner() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 px-1">
        <BellRing size={18} className="text-slate-500" />
        <h3 className="font-semibold text-slate-700">Peringatan Dini Terbaru</h3>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
        <div className="bg-amber-100 text-amber-600 p-2 rounded-full shrink-0 mt-1">
          <AlertTriangle size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Siaga Darurat
            </span>
            <span className="text-xs text-amber-600 font-medium">10 mnt yang lalu</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">Waspada Banjir Susulan di Zona A</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Diimbau kepada seluruh relawan dan masyarakat di sekitar DAS Ciliwung untuk menjauhi bantaran sungai. Tinggi muka air berstatus Siaga 1.
          </p>
        </div>
      </div>
    </section>
  );
}