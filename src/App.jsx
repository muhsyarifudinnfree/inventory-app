import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  ref,
  onValue,
  query,
  orderByChild,
  serverTimestamp,
  push,
  update,
  remove,
} from "firebase/database";

// Konfigurasi & Service
import { auth, db } from "./config/firebase";
import { fetchUserData } from "./services/userService";

// Komponen Layout
import Sidebar from "./components/Layout/Sidebar";
import Hero from "./components/Layout/Hero";
import Footer from "./components/Layout/Footer";

// Fitur (Halaman & Modal)
import LoginScreen from "./features/Auth/LoginScreen";
import DashboardStats from "./features/Dashboard/DashboardStats";
import InventoryList from "./features/Inventory/InventoryList";
import TeknisiDashboard from "./features/Dashboard/TeknisiDashboard";
import ReportingView from "./features/Reporting/ReportingView";
import ItemModal from "./features/Inventory/ItemModal";
import MaintenanceModal from "./features/Maintenance/MaintenanceModal";

const COLLECTION_NAME = "inventory_items";
const LOGS_COLLECTION = "maintenance_logs"; // Tabel Database untuk Riwayat/History

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // DATA UTAMA
  const [items, setItems] = useState([]); // Data Aset Aktif
  const [logs, setLogs] = useState([]); // Data Riwayat Pekerjaan (History)
  const [loadingData, setLoadingData] = useState(true);

  // STATE UI & MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isVerificationMode, setIsVerificationMode] = useState(false); // Mode Admin Verifikasi
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- 1. AUTH & ROLE ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        setLoading(true);
        const userData = await fetchUserData(userAuth.uid);

        if (userData) {
          setCurrentUser({
            uid: userAuth.uid,
            email: userAuth.email,
            ...userData,
          });
        } else {
          console.error("User login tapi tidak ada data role di RTDB");
          setCurrentUser({
            uid: userAuth.uid,
            email: userAuth.email,
            role: "guest",
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. DATA SYNC (LIVE & HISTORY) ---
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      setLogs([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // A. Sync Inventory Items (Data Hidup)
    const itemsRef = ref(db, COLLECTION_NAME);
    const qItems = query(itemsRef, orderByChild("lastUpdated"));
    const unsubItems = onValue(qItems, (snapshot) => {
      const dataObject = snapshot.val();
      if (dataObject) {
        const dataArray = Object.keys(dataObject).map((key) => ({
          id: key,
          ...dataObject[key],
        }));
        setItems(dataArray.reverse());
      } else {
        setItems([]);
      }
    });

    // B. Sync Maintenance Logs (Data Riwayat)
    const logsRef = ref(db, LOGS_COLLECTION);
    const qLogs = query(logsRef, orderByChild("finishedAt"));
    const unsubLogs = onValue(qLogs, (snapshot) => {
      const dataObject = snapshot.val();
      if (dataObject) {
        const dataArray = Object.keys(dataObject).map((key) => ({
          id: key,
          ...dataObject[key],
        }));
        setLogs(dataArray.reverse());
      } else {
        setLogs([]);
      }
    });

    setLoadingData(false);

    // Cleanup listeners
    return () => {
      unsubItems();
      unsubLogs();
    };
  }, [currentUser]);

  // --- 3. CRUD HANDLERS ---

  // HANDLE SAVE (ADMIN: Tambah / Edit / Verifikasi)
  const handleSave = async (formData) => {
    try {
      // KASUS 1: ADMIN VERIFIKASI (Tindak Lanjut dari Teknisi)
      if (isVerificationMode) {
        // A. Update Status Aset di Tabel Utama
        await update(ref(db, `${COLLECTION_NAME}/${editingItem.id}`), {
          ...formData,
          issue: null,
          lastUpdated: serverTimestamp(),
          updatedBy: currentUser?.displayName,
        });

        // B. Simpan Arsip ke Tabel History (Logs)
        await push(ref(db, LOGS_COLLECTION), {
          originalItemId: editingItem.id,
          itemName: formData.name,
          itemCode: formData.code,
          category: formData.category,
          finalStatus: formData.status,
          issue: editingItem.issue || "Tidak ada deskripsi",
          resolution: editingItem.notes || "Tidak ada catatan teknisi",
          verificationNotes: formData.notes,
          reportedAt: editingItem.reportedAt || null,
          finishedAt: serverTimestamp(),
          verifiedBy: currentUser?.displayName,
        });
      } else {
        // KASUS 2: ADMIN TAMBAH/EDIT BIASA
        const finalStatus = !editingItem ? "Aset Baru" : formData.status;
        const payload = {
          ...formData,
          status: finalStatus,
          lastUpdated: serverTimestamp(),
          updatedBy: currentUser?.displayName || "Admin",
        };

        if (editingItem) {
          await update(
            ref(db, `${COLLECTION_NAME}/${editingItem.id}`),
            payload
          );
        } else {
          await push(ref(db, COLLECTION_NAME), {
            ...payload,
            createdAt: serverTimestamp(),
          });
        }
      }

      closeModal();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    }
  };

  // --- PERUBAHAN DI FUNGSI INI ---
  // HANDLE REPORT (ADMIN: Lapor Kerusakan)
  // Menerima 3 parameter, termasuk 'whatsapp' dari ReportingView.jsx
  const handleReportDamage = async (item, issueDescription, whatsapp) => {
    try {
      await update(ref(db, `${COLLECTION_NAME}/${item.id}`), {
        status: "Rusak",
        issue: issueDescription, // Simpan Masalah Awal
        whatsapp: whatsapp, // Simpan/Update Nomor PIC
        reportedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        updatedBy: currentUser?.displayName,
      });
      alert("Laporan berhasil dikirim ke Teknisi.");
    } catch (e) {
      alert("Gagal membuat laporan.");
    }
  };

  // HANDLE UPDATE (TEKNISI: Update Progress)
  const handleMaintenanceUpdate = async (id, data) => {
    try {
      await update(ref(db, `${COLLECTION_NAME}/${id}`), {
        status: data.status,
        notes: data.notes, // Catatan teknisi
        lastUpdated: serverTimestamp(),
        updatedBy: currentUser?.displayName || "Teknisi",
      });
      setMaintenanceModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      alert("Gagal update.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin menghapus item ini?")) {
      await remove(ref(db, `${COLLECTION_NAME}/${id}`));
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setIsVerificationMode(false);
  };

  // --- 4. RENDER ---
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-500">
        Memuat Sistem...
      </div>
    );
  if (!currentUser) return <LoginScreen />;
  if (currentUser.role === "guest")
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        Akses Ditolak: Role Tidak Ditemukan
      </div>
    );

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats items={items} />;

      case "inventory":
        if (currentUser.role === "manager" || currentUser.role === "admin") {
          return (
            <InventoryList
              items={items}
              onEdit={(item) => {
                setEditingItem(item);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              onAdd={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              userRole={currentUser.role}
            />
          );
        }
        return (
          <div className="p-10 text-center text-slate-500">Akses Terbatas.</div>
        );

      case "reporting":
        if (currentUser.role === "manager" || currentUser.role === "admin") {
          return (
            <ReportingView
              items={items}
              logs={logs}
              onReportDamage={handleReportDamage} // Fungsi 3 parameter diteruskan
              onVerifyRepair={(item) => {
                setEditingItem(item);
                setIsVerificationMode(true);
                setModalOpen(true);
              }}
            />
          );
        }
        return (
          <div className="p-10 text-center text-slate-500">Akses Terbatas.</div>
        );

      case "maintenance":
        if (currentUser.role === "teknisi") {
          return (
            <TeknisiDashboard
              items={items}
              logs={logs}
              onOpenMaintenance={(item) => {
                setEditingItem(item);
                setMaintenanceModalOpen(true);
              }}
            />
          );
        } else {
          return (
            <InventoryList
              items={items.filter((i) =>
                [
                  "Rusak",
                  "Sedang Diperbaiki",
                  "Selesai Diperbaiki",
                  "Rusak Total",
                ].includes(i.status)
              )}
              onEdit={(item) => {
                setEditingItem(item);
                setIsVerificationMode(true);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
              onAdd={() => {}}
              userRole={currentUser.role}
              isMaintenanceView={true}
            />
          );
        }

      default:
        return <DashboardStats items={items} />;
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-screen font-sans text-slate-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => signOut(auth)}
        userRole={currentUser.role}
      />
      <main className="flex-1 ml-64 p-8 flex flex-col min-h-screen">
        <Hero user={currentUser} />
        <div className="flex-1">
          {loadingData ? (
            <div className="text-center py-20 text-slate-400">
              Mengambil data...
            </div>
          ) : (
            renderActiveView()
          )}
        </div>
        <Footer />
      </main>

      {modalOpen && (
        <ItemModal
          item={editingItem}
          onClose={closeModal}
          onSubmit={handleSave}
          isVerificationMode={isVerificationMode}
        />
      )}

      {maintenanceModalOpen && (
        <MaintenanceModal
          item={editingItem}
          onClose={() => setMaintenanceModalOpen(false)}
          onSubmit={handleMaintenanceUpdate}
        />
      )}
    </div>
  );
}

export default App;
