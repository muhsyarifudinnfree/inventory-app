// src/components/Layout/Hero.jsx
import React from "react";
import { Building2, Globe } from "lucide-react";

const Hero = ({ user }) => (
  // PERBAIKAN RESPONSIVE: Tambahkan padding-top di mobile (pt-20) agar ada ruang untuk tombol menu
  // Hapus padding-top di desktop (lg:pt-8)
  <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white p-8 pt-20 lg:pt-8 rounded-2xl shadow-xl relative overflow-hidden border border-slate-700">
    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>

    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
        <Building2 size={48} className="text-blue-300" />
      </div>
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight text-white">
          Sistem Inventaris
        </h1>
        <p className="text-blue-200 text-lg font-light flex items-center gap-2">
          <Globe size={16} /> Dashboard Manajemen Aset
        </p>
      </div>
      <div className="text-right hidden md:block bg-white/5 px-6 py-3 rounded-lg border border-white/10">
        <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">
          User Aktif
        </p>
        <p className="text-xl font-semibold text-white">
          {user?.displayName || "User"}
        </p>
      </div>
    </div>
  </div>
);

export default Hero;
