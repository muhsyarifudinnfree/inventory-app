import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  History,
  FileText,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";

// TERIMA PROP 'logs' DISINI
const TeknisiDashboard = ({ items, logs, onOpenMaintenance }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [reportMonth, setReportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // --- 1. TUGAS AKTIF ---
  // Mengambil dari 'items' (Aset Live)
  // Status: Rusak, Sedang Diperbaiki, atau Selesai (tapi belum diverifikasi Admin)
  const activeTasks = items.filter((i) =>
    [
      "Rusak",
      "Sedang Diperbaiki",
      "Selesai Diperbaiki",
      "Rusak Total",
    ].includes(i.status)
  );

  // --- 2. RIWAYAT PEKERJAAN (LOGS) ---
  // Mengambil dari 'logs' (Arsip Permanen) agar data tidak hilang setelah diverifikasi Admin
  const historyTasks = useMemo(() => {
    if (!logs) return [];

    return logs.filter((log) => {
      // Filter Waktu: Berdasarkan tanggal selesai (finishedAt)
      let isSameMonth = false;
      if (log.finishedAt) {
        const logDate = new Date(log.finishedAt).toISOString().slice(0, 7);
        isSameMonth = logDate === reportMonth;
      }
      return isSameMonth;
    });
  }, [logs, reportMonth]);

  // --- FUNGSI EXPORT EXCEL ---
  const exportReport = () => {
    if (historyTasks.length === 0)
      return alert("Tidak ada data pekerjaan pada bulan ini.");

    const dataToExport = historyTasks.map((log) => ({
      "Tanggal Selesai": new Date(log.finishedAt).toLocaleDateString("id-ID"),
      "Nama Aset": log.itemName,
      "Kode Aset": log.itemCode,
      Kategori: log.category,
      "Status Akhir": log.finalStatus, // Status saat selesai (misal: Operasional/Disposal)
      "Kendala Awal": log.issue || "-",
      "Solusi/Perbaikan": log.resolution || "-", // Apa yang teknisi kerjakan
      "Diverifikasi Oleh": log.verifiedBy || "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pekerjaan");
    XLSX.writeFile(wb, `Laporan_Teknisi_${reportMonth}.xlsx`);
  };

  // --- RENDER KARTU (ADAPTIF) ---
  const renderCard = (data, isHistoryView) => {
    // Normalisasi Data: Karena struktur 'items' dan 'logs' sedikit beda
    const item = isHistoryView
      ? {
          id: data.id,
          name: data.itemName,
          code: data.itemCode,
          status: data.finalStatus, // Status akhir di log
          location: "-", // Log mungkin tidak simpan lokasi (opsional)
          issue: data.issue,
          notes: data.resolution, // Di log, 'notes' teknisi disimpan sebagai 'resolution'
          lastUpdated: data.finishedAt,
        }
      : data;

    return (
      <div
        key={item.id}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
      >
        <div
          className={`h-2 w-full ${
            item.status === "Rusak"
              ? "bg-red-500"
              : item.status === "Sedang Diperbaiki"
              ? "bg-yellow-500"
              : ["Selesai Diperbaiki", "Operasional"].includes(item.status)
              ? "bg-green-500"
              : "bg-slate-600"
          }`}
        ></div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-lg leading-tight">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {item.code}
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-slate-100 text-slate-600">
              {item.status}
            </span>
          </div>

          {/* Lokasi hanya ada di Live Item */}
          {!isHistoryView && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Clock size={14} />
              <span>
                Lokasi:{" "}
                <span className="font-semibold text-slate-700">
                  {item.location}
                </span>
              </span>
            </div>
          )}

          <div className="bg-red-50 p-3 rounded-xl mb-3 border border-red-100">
            <p className="text-xs text-red-500 mb-1 uppercase font-bold flex items-center gap-1">
              <AlertTriangle size={12} /> Kendala:
            </p>
            <p className="text-sm text-slate-700 font-medium line-clamp-2">
              "{item.issue || "-"}"
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl mb-5 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1 uppercase font-bold">
              Laporan Perbaikan:
            </p>
            <p className="text-sm text-slate-600 italic line-clamp-3">
              "{item.notes || "-"}"
            </p>
          </div>

          {/* Tombol Update HANYA muncul jika statusnya belum selesai/belum diverifikasi */}
          {!isHistoryView &&
            ["Rusak", "Sedang Diperbaiki"].includes(item.status) && (
              <button
                onClick={() => onOpenMaintenance(item)}
                className="w-full py-2.5 bg-slate-800 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Wrench size={16} /> Update Progress
              </button>
            )}

          {/* Jika tugas aktif tapi statusnya sudah selesai (menunggu admin) */}
          {!isHistoryView &&
            ["Selesai Diperbaiki", "Rusak Total"].includes(item.status) && (
              <div className="text-center text-xs text-purple-600 font-bold bg-purple-50 py-2 rounded-lg border border-purple-100">
                ⏳ Menunggu Verifikasi Admin
              </div>
            )}

          {isHistoryView && (
            <div className="text-right text-xs text-slate-400 font-medium border-t pt-3 mt-2">
              Selesai: {new Date(item.lastUpdated).toLocaleDateString("id-ID")}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Ruang Kerja Teknisi
        </h2>

        {activeTab === "history" && (
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={16} className="text-slate-400 ml-2" />
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="text-sm text-slate-700 outline-none bg-transparent"
            />
            <button
              onClick={exportReport}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition"
            >
              <FileText size={16} /> Export Laporan
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 bg-slate-200 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "active"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Wrench size={16} /> Tugas & Pending ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-white text-slate-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History size={16} /> Arsip Pekerjaan ({historyTasks.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeTab === "active" ? (
          activeTasks.length > 0 ? (
            activeTasks.map((item) => renderCard(item, false))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <CheckCircle className="mx-auto text-green-200 mb-3" size={48} />
              <p className="text-slate-400 font-medium">
                Tidak ada tugas aktif.
              </p>
            </div>
          )
        ) : historyTasks.length > 0 ? (
          historyTasks.map((item) => renderCard(item, true))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <History className="mx-auto text-slate-200 mb-3" size={48} />
            <p className="text-slate-400 font-medium">
              Tidak ada riwayat pekerjaan (Log) pada bulan {reportMonth}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeknisiDashboard;
