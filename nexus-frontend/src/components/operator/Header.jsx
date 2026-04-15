import { Bell, User, Menu } from 'lucide-react'; 

export default function Header({ activeTab, onOpenMenu }) {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'beranda': return 'Beranda Instansi';
      case 'faskes': return 'Kapasitas Faskes';
      case 'logistik': return 'Ketersediaan Logistik';
      case 'riwayat': return 'Riwayat Pembaruan';
      default: return 'Portal NEXUS';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 w-full">
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h2 className="font-bold text-base sm:text-lg text-slate-800 transition-all duration-300">
          {getHeaderTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors p-1 hidden sm:block">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Angga N.</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operator</p>
          </div>
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 overflow-hidden shrink-0">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}