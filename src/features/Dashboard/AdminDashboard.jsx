import React, { useState } from "react";
import { Plus } from "lucide-react";

// Import komponen-komponen yang sudah ada
import InventoryList from "../Inventory/InventoryList";
import MaintenanceView from "../Maintenance/MaintenanceView";

// Menerima data dan fungsi-fungsi dari App.jsx
const AdminDashboard = ({
  items,
  onEditItem,
  onDeleteItem,
  onResolveItem,
  onAddItem,
}) => {
  const [tab, setTab] = useState("inventory");

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        {/* Navigasi Tab Internal Admin */}
        <div className="flex gap-2 bg-slate-200 p-1.5 rounded-xl">
          <button
            onClick={() => setTab("inventory")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold ${
              tab === "inventory" ? "bg-white shadow" : "text-slate-600"
            }`}
          >
            Inventaris
          </button>
          <button
            onClick={() => setTab("maintenance")}
            className={`px-6 py-2 rounded-lg text-sm font-semibold ${
              tab === "maintenance" ? "bg-white shadow" : "text-slate-600"
            }`}
          >
            Perbaikan
          </button>
        </div>

        {tab === "inventory" && (
          <button
            onClick={onAddItem}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-medium"
          >
            <Plus size={20} /> Tambah Aset
          </button>
        )}
      </div>

      {/* Konten Tab */}
      {tab === "inventory" && (
        <InventoryList
          items={items}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      )}
      {tab === "maintenance" && (
        <MaintenanceView items={items} onResolve={onResolveItem} />
      )}
    </div>
  );
};

export default AdminDashboard;
