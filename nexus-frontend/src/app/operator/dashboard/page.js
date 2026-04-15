"use client";

import { useState } from 'react';
import Sidebar from '@/components/operator/Sidebar';
import Header from '@/components/operator/Header';
import Summary from '@/components/operator/Summary';
import ResourceTable from '@/components/operator/ResourceTable';
import HistoryTable from '@/components/operator/HistoryTable';
import ModalAddData from '@/components/operator/ModalAddData';
import ModalUpdateData from '@/components/operator/ModalUpdateData';

export default function OperatorDashboardPage() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <Summary />;
      case 'faskes': 
      case 'logistik': 
        return <ResourceTable activeTab={activeTab} onAdd={() => setShowAddModal(true)} onUpdate={(item) => {setSelectedItem(item); setShowUpdateModal(true)}} />;
      case 'riwayat': return <HistoryTable />;
      default: return <Summary />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header activeTab={activeTab} onOpenMenu={() => setIsMobileMenuOpen(true)} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {renderContent()}
        </div>
      </main>

      <ModalAddData isOpen={showAddModal} onClose={() => setShowAddModal(false)} activeTab={activeTab} />
      <ModalUpdateData isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} selectedItem={selectedItem} />
    </div>
  );
}