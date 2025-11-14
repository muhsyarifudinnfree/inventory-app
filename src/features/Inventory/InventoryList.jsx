import React, { useState, useMemo } from "react";
import {
  Edit,
  Trash2,
  MessageSquare,
  Image as ImageIcon,
  Search,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { STATUS_COLORS } from "../../constants";

const InventoryList = ({
  items,
  onEdit,
  onDelete,
  onAdd,
  userRole,
  isMaintenanceView = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // --- Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code &&
          item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDate = filterDate
        ? item.lastUpdated &&
          new Date(item.lastUpdated).toISOString().slice(0, 10) === filterDate
        : true;
      return matchesSearch && matchesDate;
    });
  }, [items, searchTerm, filterDate]);

  // --- Sorting ---
  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  // --- Handlers ---
  const sendWA = (number, itemName) => {
    if (!number) return alert("Tidak ada nomor WA");
    let formatted = number.replace(/\D/g, "");
    if (formatted.startsWith("0")) formatted = "62" + formatted.slice(1);
    const text = `Halo, mohon follow up untuk aset: ${itemName}`;
    window.open(
      `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const getDuration = (timestamp) => {
    if (!timestamp) return "-";
    const diff = new Date().getTime() - timestamp;
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} Hari` : "Hari ini";
  };

  const requestSort = (key) => {
    if (!isMaintenanceView) {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    }
  };

  const getSortArrow = (key) => {
    if (isMaintenanceView || sortConfig.key !== key) {
      return <ArrowUp size={14} className="inline ml-1 text-slate-300" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} className="inline ml-1 text-blue-600" />
    ) : (
      <ArrowDown size={14} className="inline ml-1 text-blue-600" />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- PERBAIKAN TAMPILAN DI SINI ---
        - flex-col: Default (Mobile) -> Semua elemen tersusun ke bawah
        - lg:flex-row: Desktop -> Elemen tersusun ke samping
      */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Grup Kiri: Cari & Tanggal */}
        {/* - w-full: Ambil lebar penuh di mobile
           - lg:w-auto: Lebar otomatis di desktop
           - sm:flex-row: Di layar kecil (tablet), "Cari" dan "Tanggal" berdampingan
         */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari nama alat atau nomor aset..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {!isMaintenanceView && (
            <div className="relative w-full sm:w-auto">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="date"
                className="w-full sm:w-auto pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Grup Kanan: Tombol Tambah Aset */}
        {userRole === "admin" && !isMaintenanceView && (
          <div className="w-full lg:w-auto">
            <button
              onClick={onAdd}
              className="w-full lg:w-auto justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-600/20 flex items-center gap-2 transition"
            >
              <span className="text-xl">+</span> Tambah Asset
            </button>
          </div>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gambar
                </th>
                <th
                  className={`p-5 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                    !isMaintenanceView
                      ? "cursor-pointer hover:bg-slate-200 transition"
                      : ""
                  }`}
                  onClick={() => requestSort("name")}
                >
                  Asset Info
                  {!isMaintenanceView && getSortArrow("name")}
                </th>
                <th
                  className={`p-5 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                    !isMaintenanceView
                      ? "cursor-pointer hover:bg-slate-200 transition"
                      : ""
                  }`}
                  onClick={() => requestSort("status")}
                >
                  Status
                  {!isMaintenanceView && getSortArrow("status")}
                </th>
                {isMaintenanceView && (
                  <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Durasi Rusak
                  </th>
                )}
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-400 italic"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-5 w-20">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Asset"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-800 text-base">
                        {item.name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                          {item.code || "-"}
                        </span>
                        <span className="text-xs font-mono bg-blue-50 px-2 py-0.5 rounded text-blue-600 border border-blue-100">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.location}
                      </p>
                    </td>
                    <td className="p-5">
                      <span
                        className="px-3 py-1.5 rounded-full text-xs font-bold border flex w-fit items-center gap-1.5"
                        style={{
                          backgroundColor: `${STATUS_COLORS[item.status]}10`,
                          color: STATUS_COLORS[item.status],
                          borderColor: `${STATUS_COLORS[item.status]}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: STATUS_COLORS[item.status],
                          }}
                        ></span>
                        {item.status}
                      </span>
                    </td>
                    {isMaintenanceView && (
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                          <Clock size={16} className="text-orange-500" />
                          {getDuration(item.reportedAt)}
                        </div>
                      </td>
                    )}
                    <td className="p-5">
                      <div className="flex justify-end gap-2 items-center">
                        {!isMaintenanceView && (
                          <>
                            {item.whatsapp && (
                              <button
                                onClick={() => sendWA(item.whatsapp, item.name)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Chat PIC via WhatsApp"
                              >
                                <MessageSquare size={18} />
                              </button>
                            )}
                            {userRole === "admin" && (
                              <>
                                <button
                                  onClick={() => onEdit(item)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => onDelete(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {isMaintenanceView && (
                          <>
                            {item.whatsapp ? (
                              <>
                                <span className="text-sm font-semibold text-slate-600">
                                  {item.whatsapp}
                                </span>
                                <button
                                  onClick={() =>
                                    sendWA(item.whatsapp, item.name)
                                  }
                                  className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                  title={`Chat PIC ${item.whatsapp} via WhatsApp`}
                                >
                                  <MessageSquare size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                PIC tidak ada
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
