import React, { useState, useEffect } from "react";
// --- Import Baru untuk React Router ---
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// --- Import Firebase (Sama seperti sebelumnya) ---
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

// --- Konfigurasi & Service (Sama seperti sebelumnya) ---
import { auth, db } from "./config/firebase";
import { fetchUserData } from "./services/userService";

// --- Komponen Layout (Ada tambahan Header) ---
import Sidebar from "./components/Layout/Sidebar";
import Footer from "./components/Layout/Footer";
import Header from "./components/Layout/Header"; // Komponen baru untuk Hero + Tombol Menu

// --- Fitur / Halaman (Sama seperti sebelumnya) ---
import LoginScreen from "./features/Auth/LoginScreen";
import DashboardStats from "./features/Dashboard/DashboardStats";
import InventoryList from "./features/Inventory/InventoryList";
import TeknisiDashboard from "./features/Dashboard/TeknisiDashboard";
import ReportingView from "./features/Reporting/ReportingView";
import ItemModal from "./features/Inventory/ItemModal";
import MaintenanceModal from "./features/Maintenance/MaintenanceModal";

// --- Konstanta Database (Sama seperti sebelumnya) ---
const COLLECTION_NAME = "inventory_items";
const LOGS_COLLECTION = "maintenance_logs";

// --- KOMPONEN BARU UNTUK LAYOUT ---
/**
 * Komponen 'AppLayout' ini bertugas sebagai "kerangka" halaman.
 * Isinya adalah Sidebar, Header, dan Footer.
 * Halaman (seperti Dashboard, Inventory) akan di-render di dalam <Outlet />.
 */
const AppLayout = ({ user, onLogout, isMobileMenuOpen, setMobileMenuOpen }) => (
  <div className="flex bg-slate-100 min-h-screen font-sans text-slate-800">
    <Sidebar
      onLogout={onLogout}
      userRole={user.role}
      isMobileMenuOpen={isMobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    />

    {/* Backdrop (latar belakang gelap) untuk mobile saat menu terbuka */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      ></div>
    )}

    {/* Konten Utama */}
    {/* 'lg:ml-64' berarti di layar besar, beri margin kiri 64 (lebar sidebar) */}
    {/* Di layar kecil, margin 0 */}
    <main className="flex-1 lg:ml-64 p-4 sm:p-8 flex flex-col min-h-screen">
      {/* Header baru berisi Hero dan tombol menu mobile */}
      <Header
        user={user}
        onToggleMobileMenu={() => setMobileMenuOpen(!isMobileMenuOpen)}
      />
      <div className="flex-1">
        {/* <Outlet /> adalah "placeholder" dari React Router
            di sinilah <DashboardStats />, <InventoryList />, dll. akan muncul */}
        <Outlet />
      </div>
      <Footer />
    </main>
  </div>
);

// --- KOMPONEN BARU UNTUK AKSES DITOLAK ---
const AccessDenied = () => (
  <div className="p-10 text-center text-red-500 font-bold bg-red-50 rounded-lg">
    Anda tidak memiliki hak akses untuk halaman ini.
  </div>
);

// --- KOMPONEN UTAMA APLIKASI ---
function App() {
  // --- State Autentikasi & Role ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- State Data ---
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // --- State UI (Modal & Menu) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isVerificationMode, setIsVerificationMode] = useState(false);

  // State baru untuk menu mobile
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hook dari React Router untuk mendeteksi perubahan URL
  const location = useLocation();

  // --- 1. EFEK: AUTENTIKASI (Sama seperti kode lama Anda) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        setLoading(true); // Tampilkan loading saat cek role
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
            role: "guest", // Role 'guest' jika tidak ditemukan
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. EFEK: SINKRONISASI DATA (Sama seperti kode lama Anda) ---
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
  }, [currentUser]); // Efek ini jalan saat user berubah

  // --- 3. EFEK BARU: Menutup menu mobile saat pindah halaman ---
  useEffect(() => {
    // Setiap kali URL (location.pathname) berubah, tutup menu
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // --- 4. FUNGSI CRUD (Sama seperti kode lama Anda) ---

  // HANDLE SAVE (ADMIN: Tambah / Edit / Verifikasi)
  const handleSave = async (formData) => {
    try {
      if (isVerificationMode) {
        // A. Update Status Aset di Tabel Utama
        await update(ref(db, `${COLLECTION_NAME}/${editingItem.id}`), {
          ...formData,
          issue: null, // Hapus isu karena sudah selesai
          lastUpdated: serverTimestamp(),
          updatedBy: currentUser?.displayName,
        });

        // B. Simpan Arsip ke Tabel History (Logs)
        await push(ref(db, LOGS_COLLECTION), {
          originalItemId: editingItem.id,
          itemName: formData.name,
          itemCode: formData.code,
          category: formData.category,
          finalStatus: formData.status, // Misal: "Operasional" atau "Disposal"
          issue: editingItem.issue || "Tidak ada deskripsi",
          resolution: editingItem.notes || "Tidak ada catatan teknisi",
          verificationNotes: formData.notes, // Catatan dari Admin
          reportedAt: editingItem.reportedAt || null,
          finishedAt: serverTimestamp(), // Waktu selesai
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
          // Update data yang ada
          await update(
            ref(db, `${COLLECTION_NAME}/${editingItem.id}`),
            payload
          );
        } else {
          // Buat data baru
          await push(ref(db, COLLECTION_NAME), {
            ...payload,
            createdAt: serverTimestamp(),
          });
        }
      }

      closeModal(); // Tutup modal setelah sukses
    } catch (error) {
      console.error("Error saving:", error);
      alert("Gagal menyimpan data.");
    }
  };

  // HANDLE REPORT (ADMIN: Lapor Kerusakan)
  const handleReportDamage = async (item, issueDescription, whatsapp) => {
    try {
      await update(ref(db, `${COLLECTION_NAME}/${item.id}`), {
        status: "Rusak",
        issue: issueDescription, // Simpan Masalah Awal
        whatsapp: whatsapp, // Simpan/Update Nomor PIC
        reportedAt: serverTimestamp(), // Catat waktu lapor
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

  // HANDLE DELETE (ADMIN)
  const handleDelete = async (id) => {
    if (confirm("Yakin menghapus item ini secara permanen?")) {
      await remove(ref(db, `${COLLECTION_NAME}/${id}`));
    }
  };

  // --- 5. FUNGSI HELPER (Modal & UI) ---

  // Fungsi untuk menutup modal utama
  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setIsVerificationMode(false);
  };

  // Fungsi pembuka modal agar lebih rapi di 'Routes'
  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  const openAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openVerifyModal = (item) => {
    setEditingItem(item);
    setIsVerificationMode(true);
    setModalOpen(true);
  };
  const openMaintenanceModal = (item) => {
    setEditingItem(item);
    setMaintenanceModalOpen(true);
  };

  // --- 6. RENDER APLIKASI ---

  // Tampilan Loading Awal (Saat cek auth)
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 font-bold text-slate-500">
        Memuat Sistem...
      </div>
    );

  // Tampilan Loading Data (di dalam halaman)
  const DataLoading = () => (
    <div className="text-center py-20 text-slate-400">Mengambil data...</div>
  );

  return (
    <>
      {/* <Routes> adalah inti dari React Router.
        Dia akan memilih <Route> mana yang akan ditampilkan berdasarkan URL.
      */}
      <Routes>
        {!currentUser ? (
          // --- GRUP 1: Pengguna BELUM Login ---
          <>
            <Route path="/login" element={<LoginScreen />} />
            {/* Jika akses URL lain, lempar ke /login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : currentUser.role === "guest" ? (
          // --- GRUP 2: Pengguna Login tapi Role tidak dikenal ---
          <Route
            path="*"
            element={
              <div className="h-screen flex items-center justify-center p-4">
                <div className="text-center p-10 bg-white shadow-lg rounded-xl text-red-500 font-bold">
                  Akses Ditolak: Role Tidak Ditemukan.
                  <button
                    onClick={() => signOut(auth)}
                    className="block mx-auto mt-4 text-blue-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            }
          />
        ) : (
          // --- GRUP 3: Pengguna SUDAH Login dan punya Role ---
          <Route
            path="/"
            element={
              <AppLayout
                user={currentUser}
                onLogout={() => signOut(auth)}
                isMobileMenuOpen={isMobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
              />
            }
          >
            {/* Rute-rute ini akan di-render di dalam <Outlet /> di AppLayout */}

            {/* Rute default ( / ) akan diarahkan ke /dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* /dashboard */}
            <Route
              path="dashboard"
              element={
                loadingData ? <DataLoading /> : <DashboardStats items={items} />
              }
            />

            {/* /inventory (hanya admin/manager) */}
            <Route
              path="inventory"
              element={
                currentUser.role === "admin" ||
                currentUser.role === "manager" ? (
                  loadingData ? (
                    <DataLoading />
                  ) : (
                    <InventoryList
                      items={items}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      onAdd={openAddModal}
                      userRole={currentUser.role}
                    />
                  )
                ) : (
                  <AccessDenied />
                )
              }
            />

            {/* /reporting (hanya admin/manager) */}
            <Route
              path="reporting"
              element={
                currentUser.role === "admin" ||
                currentUser.role === "manager" ? (
                  loadingData ? (
                    <DataLoading />
                  ) : (
                    <ReportingView
                      items={items}
                      logs={logs}
                      onReportDamage={handleReportDamage}
                      onVerifyRepair={openVerifyModal}
                    />
                  )
                ) : (
                  <AccessDenied />
                )
              }
            />

            {/* /maintenance (logika berbeda per role) */}
            <Route
              path="maintenance"
              element={
                loadingData ? (
                  <DataLoading />
                ) : currentUser.role === "teknisi" ? (
                  // Tampilan Teknisi
                  <TeknisiDashboard
                    items={items}
                    logs={logs}
                    onOpenMaintenance={openMaintenanceModal}
                  />
                ) : (
                  // Tampilan Admin/Manager (daftar item yang perlu diperbaiki)
                  <InventoryList
                    items={items.filter((i) =>
                      [
                        "Rusak",
                        "Sedang Diperbaiki",
                        "Selesai Diperbaiki",
                        "Rusak Total",
                      ].includes(i.status)
                    )}
                    onEdit={openVerifyModal} // Admin/Manager di sini 'onEdit' berarti 'verifikasi'
                    onDelete={handleDelete}
                    onAdd={() => {}} // Tidak ada tombol 'tambah' di halaman ini
                    userRole={currentUser.role}
                    isMaintenanceView={true} // Mode khusus untuk tabel
                  />
                )
              }
            />

            {/* Rute 'catch-all' jika halaman tidak ditemukan, lempar ke dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>

      {/* --- MODAL (Render di luar <Routes>) --- */}
      {/* Modal ini akan tampil di atas halaman manapun jika 'modalOpen' true */}
      {modalOpen && (
        <ItemModal
          item={editingItem}
          onClose={closeModal}
          onSubmit={handleSave}
          isVerificationMode={isVerificationMode}
        />
      )}

      {/* Modal khusus teknisi */}
      {maintenanceModalOpen && (
        <MaintenanceModal
          item={editingItem}
          onClose={() => setMaintenanceModalOpen(false)}
          onSubmit={handleMaintenanceUpdate}
        />
      )}
    </>
  );
}

export default App;
