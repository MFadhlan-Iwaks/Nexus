'use client';

// src/app/operator/dashboard/page.js
// Operator dashboard — logistik dari logisticService, faskes dari facilityService

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/operator/Sidebar';
import Header from '@/components/operator/Header';
import Summary from '@/components/operator/Summary';
import ResourceTable from '@/components/operator/ResourceTable';
import HistoryTable from '@/components/operator/HistoryTable';
import ModalAddData from '@/components/operator/ModalAddData';
import ModalUpdateData from '@/components/operator/ModalUpdateData';
import BroadcastNotice from '@/components/common/BroadcastNotice';
import { LoadingState, ErrorState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';
import { getLocalUser } from '@/services/authService';

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
  const router = useRouter();
  const user = getLocalUser();
  const hasUser = Boolean(user);
  const role = String(user?.role || '').toLowerCase();

  useEffect(() => {
    if (!hasUser) {
      document.cookie = 'role=; Max-Age=0; path=/; samesite=lax';
      document.cookie = 'token=; Max-Age=0; path=/; samesite=lax';
      router.replace('/auth');
      return;
    }
    if (role !== 'operator') {
      const target = role === 'admin'
        ? '/admin/dashboard'
        : role === 'trc'
          ? '/trc/dashboard'
          : role === 'masyarakat'
            ? '/masyarakat/dashboard'
            : '/auth';
      router.replace(target);
    }
  }, [hasUser, role, router]);

  if (!hasUser || role !== 'operator') {
    return <LoadingState message="Mengalihkan..." />;
  }

  return <OperatorDashboardContent />;
}

function OperatorDashboardContent() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const localUser = getLocalUser();

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
  const { data: logisticsData, loading: loadingLog, error: errorLog } = useAsync(getLogistics);
  const { data: faskesData, loading: loadingFsk, error: errorFsk } = useAsync(getFacilities);
  const { data: historyData, loading: loadingHist, error: errorHist } = useAsync(
    () => (activeTab === 'riwayat' ? getStockHistory() : []),
    [activeTab]
  );

  const isLoading = loadingLog || loadingFsk || (activeTab === 'riwayat' && loadingHist);
  const firstError = errorLog || errorFsk || (activeTab === 'riwayat' ? errorHist : null);

  const addToHistory = useCallback((entry) => {
    const full = {
      id: `hist-${Date.now()}`,
      waktu: new Date().toISOString(),
      operator: entry.operator,
      nama_item: entry.itemName,
      aksi: entry.action,
      tipe: entry.resourceType,
      stok_sebelum: entry.previousStock ?? null,
      stok_sesudah: entry.newStock ?? null,
      unit: entry.unit,
      status: entry.status,
    };
    recordStockHistory(full);
    setStockHistory((prev) => [full, ...(prev || historyData || [])]);
  }, [historyData]);

  const historyEntries = useMemo(() => (stockHistory || historyData || []).map((entry) => ({
    id: entry.id,
    time: entry.time || entry.waktu,
    operator: entry.operator || '-',
    action: entry.action || entry.aksi || 'update',
    resourceType: entry.resourceType || entry.tipe || 'logistik',
    itemName: entry.itemName || entry.nama_item || '-',
    previousStock: entry.previousStock ?? entry.stok_sebelum ?? null,
    newStock: entry.newStock ?? entry.stok_sesudah ?? null,
    unit: entry.unit || '-',
    status: entry.status || 'Sukses',
  })), [historyData, stockHistory]);

  // ─── Tambah Data ─────────────────────────────────────────

  const handleAddData = async (newItem) => {
    try {
      if (activeTab === 'faskes') {
        const { item } = await createFacility({
          ...newItem,
          stok: Number(newItem.stok),
        });
        setFaskes((prev) => [item, ...(prev || faskesData || [])]);
        addToHistory({
          operator: localUser?.nama || 'Operator',
          itemName: item.nama,
          action: 'add',
          resourceType: 'faskes',
          previousStock: null,
          newStock: item.stok,
          unit: item.unit,
          status: 'Sukses',
        });
      } else {
        const { item } = await createLogistic({
          ...newItem,
          stok: Number(newItem.stok),
        });
        setLogistics((prev) => [item, ...(prev || logisticsData || [])]);
        addToHistory({
          operator: localUser?.nama || 'Operator',
          itemName: item.nama,
          action: 'add',
          resourceType: 'logistik',
          previousStock: null,
          newStock: item.stok,
          unit: item.unit,
          status: 'Sukses',
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
          (prev || faskesData || []).map((item) => {
            if (item.id !== id) return item;
            addToHistory({
              operator: localUser?.nama || 'Operator',
              itemName: item.nama,
              action: 'update',
              resourceType: 'faskes',
              previousStock: item.stok,
              newStock: normalizedStock,
              unit: item.unit,
              status: 'Sukses',
            });
            return { ...item, stok: normalizedStock };
          })
        );
        setRecentlyUpdatedFaskesId(id);
      } else {
        await updateLogistic(id, { stok: normalizedStock }); // logisticService
        setLogistics((prev) =>
          (prev || logisticsData || []).map((item) => {
            if (item.id !== id) return item;
            addToHistory({
              operator: localUser?.nama || 'Operator',
              itemName: item.nama,
              action: 'update',
              resourceType: 'logistik',
              previousStock: item.stok,
              newStock: normalizedStock,
              unit: item.unit,
              status: 'Sukses',
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
  const faskesWithStatus = (faskes || faskesData || []).map((item) => ({
    ...item,
    status: getFaskesStatus(item.stok ?? 0),   // facilityService helper
  }));
  const logisticsWithStatus = (logistics || logisticsData || []).map((item) => ({
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
          <>
            <div className="mb-5">
              <BroadcastNotice
                title="Peringatan Admin Terbaru"
                description="Gunakan informasi ini untuk kesiapan logistik dan kapasitas layanan."
              />
            </div>
            <Summary
              activeInstitution={localUser?.id_instansi}
              faskesItems={faskesWithStatus}
              logisticItems={logisticsWithStatus}
            />
          </>
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
            entries={historyEntries}
            activeInstitution={localUser?.id_instansi}
          />
        );
      default:
        return <Summary activeInstitution={localUser?.id_instansi} faskesItems={[]} logisticItems={[]} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        activeInstitution={localUser?.id_instansi}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header
          activeTab={activeTab}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          activeInstitution={localUser?.id_instansi}
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
