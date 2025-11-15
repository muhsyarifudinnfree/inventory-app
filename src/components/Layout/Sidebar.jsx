// src/components/Layout/Sidebar.jsx
import React from "react";
// Import NavLink
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Wrench,
  LogOut,
  Box,
  FileText,
  X,
} from "lucide-react";

const Sidebar = ({
  onLogout,
  userRole,
  isMobileMenuOpen,
  setMobileMenuOpen,
}) => {
  // Menu dasar
  let menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventaris", icon: Package },
  ];

  // Menu khusus Admin/Manager (Pelaporan)
  if (userRole === "admin" || userRole === "manager") {
    menuItems.push({ id: "reporting", label: "Pelaporan", icon: FileText });
  }

  // Menu Perbaikan
  menuItems.push({ id: "maintenance", label: "Perbaikan", icon: Wrench });

  // Fungsi untuk class 'active'
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses =
      "w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 font-semibold";
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg shadow-blue-900/40`;
    } else {
      return `${baseClasses} hover:bg-slate-800 hover:text-white`;
    }
  };

  return (
    <div
      className={`w-64 bg-[#0f172a] text-slate-300 h-screen fixed left-0 top-0 flex flex-col z-30 font-sans transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="p-8 mb-4 flex items-center justify-between">
        {/* ... (kode header sidebar) ... */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <Box size={24} strokeWidth={3} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-wide">
              Inv.App
            </h1>
            <p className="text-xs text-slate-500">System Management</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1 text-slate-500 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            // INI ADALAH BAGIAN YANG BERUBAH DARI <button>
            <NavLink
              key={item.id}
              to={`/${item.id}`} // Menentukan URL tujuan
              className={getNavLinkClass} // Menentukan style
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        {/* ... (kode tombol logout) ... */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white py-4 rounded-xl transition-all font-bold uppercase tracking-wide text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
