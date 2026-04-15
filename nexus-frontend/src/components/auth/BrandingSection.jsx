import { ShieldAlert, Activity } from 'lucide-react';

export default function BrandingSection() {
  return (
    <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 border border-red-500/20 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 p-2 rounded-lg">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-wider">NEXUS</h1>
        </div>
        <p className="text-xl text-slate-300 font-light leading-relaxed">
          Network for Emergency & eXtraordinary Unified Services
        </p>
      </div>

      <div className="relative z-10 bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-emerald-400" size={20} />
          <h3 className="font-semibold">Pusat Komando Terpadu</h3>
        </div>
        <p className="text-sm text-slate-400">
          Sistem informasi berbasis crowdsourcing tervalidasi untuk penanganan darurat yang cepat.
        </p>
      </div>
    </div>
  );
}