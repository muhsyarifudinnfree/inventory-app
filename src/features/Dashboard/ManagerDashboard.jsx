import React, { useState } from "react";

// Manager juga bisa melihat AdminDashboard
import AdminDashboard from "./AdminDashboard";

const ManagerDashboard = (props) => {
  const [view, setView] = useState("overview"); // 'overview' or 'users'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("teknisi");

  const handleCreateUser = (e) => {
    e.preventDefault();
    // !! PENTING !!
    // Fitur ini tidak bisa dibuat HANYA dari sisi client (React).
    // Anda HARUS menggunakan Firebase Cloud Functions untuk membuat user
    // atas nama orang lain dengan aman.
    alert(
      "FITUR CLOUD FUNCTION DIPERLUKAN!\n\n" +
        'Membuat user (admin/teknisi) baru adalah "Admin SDK Operation". ' +
        "Ini harus dieksekusi di server (Cloud Function) untuk alasan keamanan.\n\n" +
        'Langkah selanjutnya adalah membuat Cloud Function "createUserWithRole".'
    );
    console.log("Data User Baru:", { email, displayName, role });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("overview")}
          className={`px-5 py-2 rounded-lg font-medium ${
            view === "overview" ? "bg-blue-600 text-white" : "bg-white shadow"
          }`}
        >
          Ringkasan & Inventaris
        </button>
        <button
          onClick={() => setView("users")}
          className={`px-5 py-2 rounded-lg font-medium ${
            view === "users" ? "bg-blue-600 text-white" : "bg-white shadow"
          }`}
        >
          Manajemen User
        </button>
      </div>

      {view === "overview" && (
        <div>
          <h2 className="text-2xl font-bold text-slate-800 capitalize mb-6">
            Dashboard Admin
          </h2>
          {/* Manager bisa melihat semua yang Admin lihat */}
          <AdminDashboard {...props} />
        </div>
      )}

      {view === "users" && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Buat User Baru (Admin / Teknisi)
          </h2>
          <form onSubmit={handleCreateUser} className="max-w-lg space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field w-full"
                placeholder="Nama User"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="email@baru.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Role (Hak Akses)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field w-full"
              >
                <option value="teknisi">Teknisi</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              Buat Akun
            </button>
            <p className="text-xs text-slate-500 mt-2">
              *Fitur ini memerlukan setup Cloud Function (Backend) untuk bisa
              berjalan.
            </p>
          </form>
        </div>
      )}
      <style>{`
        .input-field { width: 100%; padding: 0.6rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; transition: all; font-size: 0.9rem; }
        .input-field:focus { border-color: #3b82f6; ring: 2px solid #3b82f6; }
        .btn-primary { padding: 0.6rem 1.2rem; background-color: #2563eb; color: white; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 500; }
        .btn-primary:hover { background-color: #1d4ed8; }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;
