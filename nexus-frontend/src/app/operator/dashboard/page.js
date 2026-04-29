'use client';

// src/app/operator/dashboard/page.js
// Operator dashboard — logistik dari logisticService, faskes dari facilityService

import { useState, useCallback, useEffect } from 'react';
import Sidebar from '@/components/operator/Sidebar';
import Header from '@/components/operator/Header';
import Summary from '@/components/operator/Summary';
import ResourceTable from '@/components/operator/ResourceTable';
import HistoryTable from '@/components/operator/HistoryTable';
import ModalAddData from '@/components/operator/ModalAddData';
import ModalUpdateData from '@/components/operator/ModalUpdateData';
import { LoadingState, ErrorState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';
import { mockOperatorProfile } from '@/data/mockData';

// Logistik
import {
  getLogistics,
  createLogistic,
  updateLogistic,
  getStockHistory,
  recordStockHistory,
  getLogisticStatus,
} from '@/services/logisticService';

// Faskes — terpisah dari logistik
import {
  getFacilities,
  createFacility,
  updateFacility,
  getFaskesStatus,
} from '@/services/facilityService';

export default function OperatorDashboardPage() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recentlyUpdatedFaskesId, setRecentlyUpdatedFaskesId] = useState('');
  const [recentlyUpdatedLogisticsId, setRecentlyUpdatedLogisticsId] = useState('');

  // Local state (optimistic)
  const [logistics, setLogistics] = useState(null);
  const [faskes, setFaskes] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);

  // Fetch awal — fungsi stabil agar tidak trigger re-render loop
  const { loading: loadingLog, error: errorLog } = useAsync(getLogistics);
  const { loading: loadingFsk, error: errorFsk } = useAsync(getFacilities);
  const { loading: loadingHist, error: errorHist } = useAsync(getStockHistory);

  // Inisialisasi state lokal dari data pertama kali
  useEffect(() => {
    getLogistics().then(setLogistics).catch(() => {});
  }, []);

  useEffect(() => {
    getFacilities().then(setFaskes).catch(() => {});
  }, []);

  useEffect(() => {
    getStockHistory().then(setStockHistory).catch(() => {});
  }, []);

  const isLoading = loadingLog || loadingFsk || loadingHist;
  const firstError = errorLog || errorFsk || errorHist;

  const addToHistory = useCallback((entry) => {
    const full = { id: `hist-${Date.now()}`, waktu: new Date().toISOString(), ...entry };
    recordStockHistory(full);
    setStockHistory((prev) => [full, ...(prev || [])]);
  }, []);

  // ─── Tambah Data ─────────────────────────────────────────

  const handleAddData = async (newItem) => {
    try {
      if (activeTab === 'faskes') {
        const { item } = await createFacility({
          ...newItem,
          stok: Number(newItem.stok),
          institusi: mockOperatorProfile.instansi,
        });
        setFaskes((prev) => [item, ...(prev || [])]);
        addToHistory({
          operator: mockOperatorProfile.nama,
          nama_item: item.nama,
          aksi: 'add', tipe: 'faskes',
          stok_sebelum: null, stok_sesudah: item.stok, unit: item.unit, status: 'Sukses',
        });
      } else {
        const { item } = await createLogistic({
          ...newItem,
          stok: Number(newItem.stok),
          institusi: mockOperatorProfile.instansi,
        });
        setLogistics((prev) => [item, ...(prev || [])]);
        addToHistory({
          operator: mockOperatorProfile.nama,
          nama_item: item.nama,
          aksi: 'add', tipe: 'logistik',
          stok_sebelum: null, stok_sesudah: item.stok, unit: item.unit, status: 'Sukses',
        });
      }
    } catch (err) {
      alert(`Gagal menambah data: ${err.message}`);
    }
    setShowAddModal(false);
  };

  // ─── Update Stok/Kapasitas ───────────────────────────────

  const handleUpdateStock = async ({ id, newStock, tipe }) => {
    const normalizedStock = Number(newStock);
    try {
      if (tipe === 'faskes') {
        await updateFacility(id, { stok: normalizedStock }); // facilityService
        setFaskes((prev) =>
          prev?.map((item) => {
            if (item.id !== id) return item;
            addToHistory({
              operator: mockOperatorProfile.nama,
              nama_item: item.nama,
              aksi: 'update', tipe: 'faskes',
              stok_sebelum: item.stok, stok_sesudah: normalizedStock, unit: item.unit, status: 'Sukses',
            });
            return { ...item, stok: normalizedStock };
          })
        );
        setRecentlyUpdatedFaskesId(id);
      } else {
        await updateLogistic(id, { stok: normalizedStock }); // logisticService
        setLogistics((prev) =>
          prev?.map((item) => {
            if (item.id !== id) return item;
            addToHistory({
              operator: mockOperatorProfile.nama,
              nama_item: item.nama,
              aksi: 'update', tipe: 'logistik',
              stok_sebelum: item.stok, stok_sesudah: normalizedStock, unit: item.unit, status: 'Sukses',
            });
            return { ...item, stok: normalizedStock };
          })
        );
        setRecentlyUpdatedLogisticsId(id);
      }
    } catch (err) {
      alert(`Gagal memperbarui: ${err.message}`);
    }
    setShowUpdateModal(false);
    setSelectedItem(null);
  };

  // ─── Tambahkan status ke item ─────────────────────────────
  // Faskes: Tersedia | Hampir Penuh | Penuh
  // Logistik: Aman | Menipis | Habis
  const faskesWithStatus = (faskes || []).map((item) => ({
    ...item,
    status: getFaskesStatus(item.stok ?? 0),   // facilityService helper
  }));
  const logisticsWithStatus = (logistics || []).map((item) => ({
    ...item,
    status: getLogisticStatus(item.stok ?? 0), // logisticService helper
  }));

  // ─── Render tab content ───────────────────────────────────

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (firstError) return <ErrorState message={firstError} />;

    switch (activeTab) {
      case 'beranda':
        return (
          <Summary
            activeInstitution={mockOperatorProfile.instansi}
            faskesItems={faskesWithStatus}
            logisticItems={logisticsWithStatus}
          />
        );
      case 'faskes':
      case 'logistik':
        return (
          <ResourceTable
            activeTab={activeTab}
            onAdd={() => setShowAddModal(true)}
            onUpdate={(item) => { setSelectedItem(item); setShowUpdateModal(true); }}
            faskesItems={faskesWithStatus}
            logisticItems={logisticsWithStatus}
            highlightedFaskesId={recentlyUpdatedFaskesId}
            highlightedLogisticsId={recentlyUpdatedLogisticsId}
          />
        );
      case 'riwayat':
        return (
          <HistoryTable
            entries={stockHistory || []}
            activeInstitution={mockOperatorProfile.instansi}
          />
        );
      default:
        return <Summary activeInstitution={mockOperatorProfile.instansi} faskesItems={[]} logisticItems={[]} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        activeInstitution={mockOperatorProfile.instansi}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header
          activeTab={activeTab}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          activeInstitution={mockOperatorProfile.instansi}
        />

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
        onClose={() => { setShowUpdateModal(false); setSelectedItem(null); }}
        selectedItem={selectedItem}
        onSave={handleUpdateStock}
      />
    </div>
  );
}