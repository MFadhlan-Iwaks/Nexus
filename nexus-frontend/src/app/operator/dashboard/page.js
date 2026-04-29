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
  const [activeInstitution, setActiveInstitution] = useState('RSUD dr. Soekardjo');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recentlyUpdatedFaskesId, setRecentlyUpdatedFaskesId] = useState('');
  const [recentlyUpdatedLogisticsId, setRecentlyUpdatedLogisticsId] = useState('');

  const [faskes, setFaskes] = useState([
    { id: 'fsk-1', nama: 'RSUD dr. Soekardjo (IGD)', kategori: 'Ruang Darurat (IGD)', stok: 5, unit: 'Bed' },
    { id: 'fsk-2', nama: 'RSUD dr. Soekardjo (Rawat Inap Lt.2)', kategori: 'Kamar Rawat Inap', stok: 14, unit: 'Bed' },
    { id: 'fsk-3', nama: 'RSUD dr. Soekardjo (Bank Darah)', kategori: 'Stok Kantong Darah', stok: 8, unit: 'Kantong' },
  ]);

  const getStockStatus = (stock) => {
    if (stock <= 0) return 'Habis';
    if (stock <= 100) return 'Menipis';
    return 'Aman';
  };

  const getFaskesStatus = (capacity) => {
    if (capacity <= 0) return 'Habis';
    if (capacity <= 10) return 'Menipis';
    return 'Aman';
  };

  const [logistics, setLogistics] = useState([
    { id: 'log-1', nama: 'Beras untuk Dapur RS', kategori: 'Logistik Pangan', stok: 350, unit: 'Kg' },
    { id: 'log-2', nama: 'Air Mineral Pasien', kategori: 'Logistik Pangan', stok: 90, unit: 'Dus' },
    { id: 'log-3', nama: 'Selimut Ruang Isolasi', kategori: 'Sandang & Selimut', stok: 22, unit: 'Pcs' },
  ]);

  const [stockHistory, setStockHistory] = useState([
    {
      id: 'hist-1',
      time: '10:45 WIB',
      operator: 'Angga N.',
      itemName: 'Beras Premium',
      action: 'update',
      previousStock: 3000,
      newStock: 2500,
      unit: 'Kg',
      status: 'Sukses',
    },
  ]);

  const addHistoryEntry = (entry) => {
    setStockHistory((prev) => [entry, ...prev]);
  };

  const handleAddData = (newItem) => {
    if (activeTab !== 'logistik' && activeTab !== 'faskes') return;

    const createdItem = {
      id: `${activeTab === 'faskes' ? 'fsk' : 'log'}-${Date.now()}`,
      nama: newItem.nama,
      kategori: newItem.kategori,
      stok: Number(newItem.stok),
      unit: newItem.unit,
    };

    if (activeTab === 'faskes') {
      setFaskes((prev) => [createdItem, ...prev]);
    } else {
      setLogistics((prev) => [createdItem, ...prev]);
    }

    addHistoryEntry({
      id: `hist-${Date.now()}`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      operator: 'Angga N.',
      itemName: createdItem.nama,
      action: 'add',
      resourceType: activeTab,
      previousStock: null,
      newStock: createdItem.stok,
      unit: createdItem.unit,
      status: 'Sukses',
    });
    setShowAddModal(false);
  };

  const handleUpdateStock = ({ id, newStock, tipe }) => {
    let updatedTarget = null;
    const normalizedStock = Number(newStock);

    if (tipe === 'faskes') {
      setFaskes((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          updatedTarget = item;
          return { ...item, stok: normalizedStock };
        })
      );
      setRecentlyUpdatedFaskesId(id);
    } else {
      setLogistics((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          updatedTarget = item;
          return { ...item, stok: normalizedStock };
        })
      );
      setRecentlyUpdatedLogisticsId(id);
    }

    if (updatedTarget) {
      addHistoryEntry({
        id: `hist-${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        operator: 'Angga N.',
        itemName: updatedTarget.nama,
        action: 'update',
        resourceType: tipe,
        previousStock: updatedTarget.stok,
        newStock: normalizedStock,
        unit: updatedTarget.unit,
        status: 'Sukses',
      });
    }

    setShowUpdateModal(false);
    setSelectedItem(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <Summary activeInstitution={activeInstitution} faskesItems={faskes} logisticItems={logistics} />;
      case 'faskes': 
      case 'logistik': 
        return (
          <ResourceTable
            activeTab={activeTab}
            onAdd={() => setShowAddModal(true)}
            onUpdate={(item) => {
              setSelectedItem(item);
              setShowUpdateModal(true);
            }}
            faskesItems={faskes.map((item) => ({
              ...item,
              status: getFaskesStatus(item.stok),
            }))}
            highlightedFaskesId={recentlyUpdatedFaskesId}
            highlightedLogisticsId={recentlyUpdatedLogisticsId}
            logisticItems={logistics.map((item) => ({
              ...item,
              status: getStockStatus(item.stok),
            }))}
          />
        );
      case 'riwayat':
        return <HistoryTable entries={stockHistory} activeInstitution={activeInstitution} />;
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
        activeInstitution={activeInstitution}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header activeTab={activeTab} onOpenMenu={() => setIsMobileMenuOpen(true)} activeInstitution={activeInstitution} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {renderContent()}
        </div>
      </main>

      <ModalAddData
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        activeTab={activeTab}
        onSave={handleAddData}
      />
      <ModalUpdateData
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedItem(null);
        }}
        selectedItem={selectedItem}
        onSave={handleUpdateStock}
      />
    </div>
  );
}