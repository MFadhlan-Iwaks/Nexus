"use client";

import { useState } from 'react';
import { ListFilter, Radio } from 'lucide-react'; 
import TRCNavbar from '@/components/trc/TRCNavbar';
import TaskCard from '@/components/trc/TaskCard';
import ValidationModal from '@/components/trc/ValidationModal';
import TaskDetailModal from '@/components/trc/TaskDetailModal';
import UpdateProgressModal from '@/components/trc/UpdateProgressModal'; 

export default function TRCDashboard() {
  const [activeTab, setActiveTab] = useState('baru');
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // STATE BARU

  const tasks = [
    { 
      id: "REP-001", status: 'menunggu', jarak: "0.8 km",
      kategori: "Banjir", judul: "Banjir Luapan Sungai Ciliwung", 
      lokasi: "Jl. Bantaran Sungai No. 12, RT 04/02", koordinat: "-7.332, 108.214",
      deskripsi: "Hujan deras sejak semalam. Air setinggi lutut orang dewasa.",
      waktu: "10 Menit yang lalu", pelapor: "M. Fadhlan (0812***)",
      foto: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=400"
    },
    { 
      id: "REP-002", status: 'menunggu', jarak: "1.5 km",
      kategori: "Pohon Tumbang", judul: "Pohon Tumbang Menutup Jalan", 
      lokasi: "Jl. Otto Iskandardinata Depan Alun-alun", koordinat: "-7.327, 108.221",
      deskripsi: "Pohon beringin besar tumbang akibat angin kencang.",
      waktu: "25 Menit yang lalu", pelapor: "Asep S. (0856***)",
      foto: null
    },
    { 
      id: "REP-003", status: 'penanganan', jarak: "2.1 km",
      kategori: "Longsor", judul: "Longsor Tebing Pemukiman", 
      lokasi: "Desa Sukamaju, Blok C", koordinat: "-7.350, 108.200",
      deskripsi: "Longsor menutupi akses jalan desa.",
      waktu: "2 Jam yang lalu", pelapor: "Siti N. (0811***)",
      foto: null
    },
  ];

  const filteredTasks = tasks.filter(t => activeTab === 'baru' ? t.status === 'menunggu' : t.status === 'penanganan');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <TRCNavbar />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Operasi Lapangan</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                <Radio size={12} className="animate-pulse" /> Live Tracking Aktif
              </span>
              <p className="text-slate-500 text-sm">Lokasi Anda: Kec. Tawang</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('baru')} 
            className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'baru' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Laporan Baru (Validasi)
            <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">2</span>
            {activeTab === 'baru' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('aktif')} 
            className={`pb-3 px-4 font-bold text-sm transition-colors relative ${activeTab === 'aktif' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tugas Aktif (Penanganan)
            <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-[10px]">1</span>
            {activeTab === 'aktif' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              data={task} 
              onValidate={(t) => { setSelectedTask(t); setIsValidationModalOpen(true); }}
              onUpdate={(t) => { setSelectedTask(t); setIsUpdateModalOpen(true); }} // HANDLER BARU
              onDetail={(t) => { setSelectedTask(t); setIsDetailModalOpen(true); }} 
            />
          ))}
        </div>
      </main>

      <ValidationModal isOpen={isValidationModalOpen} onClose={() => setIsValidationModalOpen(false)} task={selectedTask} />
      <TaskDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} task={selectedTask} onOpenValidation={(t) => { setIsDetailModalOpen(false); setSelectedTask(t); setIsValidationModalOpen(true); }} />
      
      <UpdateProgressModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} task={selectedTask} />
      
    </div>
  );
}