'use client';



import { useState, useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/operator/Sidebar';
import Header from '@/components/operator/Header';
import Summary from '@/components/operator/Summary';
import ResourceTable from '@/components/operator/ResourceTable';
import HistoryTable from '@/components/operator/HistoryTable';
import ModalAddData from '@/components/operator/ModalAddData';
import ModalUpdateData from '@/components/operator/ModalUpdateData';
import ConfirmDeleteModal from '@/components/operator/ConfirmDeleteModal';
import BroadcastNotice from '@/components/common/BroadcastNotice';
import { LoadingState, ErrorState } from '@/components/common/PageStates';
import { useAsync } from '@/hooks/useAsync';


import {
  getLogistics,
  createLogistic,
  updateLogistic,
  deleteLogistic,
  getStockHistory,
  getLogisticStatus,
} from '@/services/logisticService';


import {
  getFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  getFaskesStatus,
} from '@/services/facilityService';

function subscribeUserSession(onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getUserSessionSnapshot() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user');
}

function getServerUserSessionSnapshot() {
  return null;
}

function subscribeClientReady() {
  return () => {};
}

function getClientReadySnapshot() {
  return true;
}

function getServerReadySnapshot() {
  return false;
}

export default function OperatorDashboardPage() {
  const router = useRouter();
  const sessionReady = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot
  );
  const userSession = useSyncExternalStore(
    subscribeUserSession,
    getUserSessionSnapshot,
    getServerUserSessionSnapshot
  );
  const user = useMemo(() => {
    if (!userSession) return null;
    try {
      return JSON.parse(userSession);
    } catch {
      return null;
    }
  }, [userSession]);
  const hasUser = Boolean(user);
  const role = String(user?.role || '').toLowerCase();

  useEffect(() => {
    if (!sessionReady) return;
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
  }, [hasUser, role, router, sessionReady]);

  if (!sessionReady || !hasUser || role !== 'operator') {
    return <LoadingState message="Mengalihkan..." />;
  }

  return <OperatorDashboardContent currentUser={user} />;
}

function OperatorDashboardContent({ currentUser }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const localUser = currentUser;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recentlyUpdatedFaskesId, setRecentlyUpdatedFaskesId] = useState('');
  const [recentlyUpdatedLogisticsId, setRecentlyUpdatedLogisticsId] = useState('');


  const [logistics, setLogistics] = useState(null);
  const [faskes, setFaskes] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);


  const { data: logisticsData, loading: loadingLog, error: errorLog } = useAsync(getLogistics);
  const { data: faskesData, loading: loadingFsk, error: errorFsk } = useAsync(getFacilities);
  const { data: historyData, loading: loadingHist, error: errorHist } = useAsync(
    () => (activeTab === 'riwayat' ? getStockHistory() : []),
    [activeTab]
  );

  const isLoading = loadingLog || loadingFsk || (activeTab === 'riwayat' && loadingHist);
  const firstError = errorLog || errorFsk || (activeTab === 'riwayat' ? errorHist : null);

  const refreshHistory = useCallback(async () => {
    const latestHistory = await getStockHistory();
    setStockHistory(latestHistory);
  }, []);

  const historyEntries = useMemo(() => {
    const seen = new Set();
    return (stockHistory || historyData || [])
      .filter((entry) => {
        const type = entry.tipe || entry.resourceType || 'riwayat';
        const key = entry.id
          ? `${type}-${entry.id}`
          : `${type}-${entry.waktu}-${entry.nama_item}-${entry.aksi}-${entry.stok_sesudah}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((entry) => ({
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
      }));
  }, [historyData, stockHistory]);



  const handleAddData = async (newItem) => {
    try {
      if (activeTab === 'faskes') {
        const { item } = await createFacility({
          ...newItem,
          stok: Number(newItem.stok),
        });
        setFaskes((prev) => [item, ...(prev || faskesData || [])]);
        await refreshHistory();
      } else {
        const { item } = await createLogistic({
          ...newItem,
          stok: Number(newItem.stok),
        });
        setLogistics((prev) => [item, ...(prev || logisticsData || [])]);
        await refreshHistory();
      }
    } catch (err) {
      alert(`Gagal menambah data: ${err.message}`);
    }
    setShowAddModal(false);
  };



  const handleUpdateStock = async ({ id, newStock, tipe }) => {
    const normalizedStock = Number(newStock);
    try {
      if (tipe === 'faskes') {
        await updateFacility(id, { stok: normalizedStock }); 
        setFaskes((prev) =>
          (prev || faskesData || []).map((item) =>
            item.id === id ? { ...item, stok: normalizedStock } : item
          )
        );
        await refreshHistory();
        setRecentlyUpdatedFaskesId(id);
      } else {
        await updateLogistic(id, { stok: normalizedStock }); 
        setLogistics((prev) =>
          (prev || logisticsData || []).map((item) =>
            item.id === id ? { ...item, stok: normalizedStock } : item
          )
        );
        await refreshHistory();
        setRecentlyUpdatedLogisticsId(id);
      }
    } catch (err) {
      alert(`Gagal memperbarui: ${err.message}`);
    }
    setShowUpdateModal(false);
    setSelectedItem(null);
  };

  const handleRequestDeleteResource = (item) => {
    setDeleteTarget({ item, type: item.tipe || activeTab });
  };

  const handleConfirmDeleteResource = async () => {
    if (!deleteTarget) return;

    const { item, type } = deleteTarget;
    setIsDeleting(true);
    try {
      if (type === 'faskes') {
        await deleteFacility(item.id);
        setFaskes((prev) => (prev || faskesData || []).filter((faskesItem) => faskesItem.id !== item.id));
      } else {
        await deleteLogistic(item.id);
        setLogistics((prev) => (prev || logisticsData || []).filter((logisticItem) => logisticItem.id !== item.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      alert(`Gagal menghapus ${type === 'faskes' ? 'faskes' : 'logistik'}: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };


  const faskesWithStatus = (faskes || faskesData || []).map((item) => ({
    ...item,
    status: getFaskesStatus(item.stok ?? 0),   
  }));
  const logisticsWithStatus = (logistics || logisticsData || []).map((item) => ({
    ...item,
    status: getLogisticStatus(item.stok ?? 0), 
  }));



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
            key={activeTab}
            activeTab={activeTab}
            onAdd={() => setShowAddModal(true)}
            onUpdate={(item) => { setSelectedItem(item); setShowUpdateModal(true); }}
            onDelete={handleRequestDeleteResource}
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
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        item={deleteTarget?.item}
        resourceType={deleteTarget?.type}
        loading={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDeleteResource}
      />
    </div>
  );
}
