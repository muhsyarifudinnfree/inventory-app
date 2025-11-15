// src/components/Layout/Header.jsx
import React from "react";
import Hero from "./Hero";
import { Menu } from "lucide-react"; // Icon hamburger

const Header = ({ user, onToggleMobileMenu }) => {
  return (
    <div className="relative mb-8">
      {/* Tombol Menu Mobile */}
      {/* Tampil HANYA di mobile (lg:hidden) */}
      <button
        onClick={onToggleMobileMenu}
        className="lg:hidden absolute top-4 left-4 z-10 bg-white/10 p-2 rounded-lg text-white backdrop-blur-sm"
      >
        <Menu size={24} />
      </button>

      {/* Hero card */}
      <Hero user={user} />
    </div>
  );
};

export default Header;
