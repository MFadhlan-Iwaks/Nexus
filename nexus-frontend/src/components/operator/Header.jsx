import { Menu } from 'lucide-react';
import UserProfileDropdown from '@/components/common/UserProfileDropdown';
import NotificationBell from '@/components/common/NotificationBell';

export default function Header({ activeTab, onOpenMenu }) {
  const operatorDefaultProfile = {
    name: 'Angga N.',
    role: 'Operator',
    id: 'OPR-001',
    phone: '0833-4455-6677',
    email: 'operator@nexus.id',
    instansi: 'Dinas Kesehatan Kota',
    address: 'Posko Instansi Kota'
  };

  const operatorNotifications = [
    {
      id: 'opr-1',
      title: 'Permintaan Logistik',
      message: 'TRC meminta tambahan paket medis darurat.',
      time: '4 menit lalu',
      read: false
    },
    {
      id: 'opr-2',
      title: 'Update Kapasitas Faskes',
      message: 'Puskesmas Cihideung memperbarui ketersediaan bed.',
      time: '15 menit lalu',
      read: true
    }
  ];

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
        <NotificationBell items={operatorNotifications} className="hidden sm:block" />

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <UserProfileDropdown
          defaultProfile={operatorDefaultProfile}
          roleClassName="text-slate-500"
          avatarClassName="bg-blue-50 text-blue-600"
        />
      </div>
    </header>
  );
}