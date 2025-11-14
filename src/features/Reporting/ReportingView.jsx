import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Clock,
  MessageSquare, // Ikon WhatsApp
  CheckCircle,
  Search,
  CheckSquare,
  FileText,
  X,
  Calendar,
} from "lucide-react";
import * as XLSX from "xlsx";

const ReportingView = ({ items, logs, onReportDamage, onVerifyRepair }) => {
  const [activeTab, setActiveTab] = useState("action");
  const [searchTerm, setSearchTerm] = useState("");
  const [exportMonth, setExportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // --- STATE UNTUK MODAL PELAPORAN ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedItemToReport, setSelectedItemToReport] = useState(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [picWhatsapp, setPicWhatsapp] = useState("");
  const [formError, setFormError] = useState("");

  // --- FILTER DATA ---
  const actionItems = items.filter((i) =>
    ["Selesai Diperbaiki", "Rusak Total"].includes(i.status)
  );
  const operationalItems = items.filter((i) => {
    const isOperational = i.status === "Operasional";
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.code && i.code.toLowerCase().includes(searchTerm.toLowerCase()));
    return isOperational && matchesSearch;
  });
  const monthlyHistory = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log) => {
      if (!log.finishedAt) return false;
      const logDate = new Date(log.finishedAt).toISOString().slice(0, 7);
      return logDate === exportMonth;
    });
  }, [logs, exportMonth]);

  // --- HANDLERS ---
  const openReportModal = (item) => {
    setSelectedItemToReport(item);
    setIssueDescription("");
    setPicWhatsapp(item.whatsapp || "628"); // Default 628
    setFormError("");
    setIsReportModalOpen(true);
  };

  const submitReport = () => {
    setFormError("");

    // --- VALIDASI BARU SESUAI PERMINTAAN ---
    // 1. Validasi Detail Masalah
    if (!issueDescription.trim()) {
      setFormError("Mohon isi detail kerusakan.");
      return;
    }
    // 2. Validasi Nomor PIC (Format 628, 12-14 digit)
    const whatsappRegex = /^628\d{9,11}$/; // (628) + (9-11 digit) = 12-14 digit TOTAL

    if (!picWhatsapp.trim()) {
      setFormError("Mohon isi nomor PIC.");
      return;
    }
    if (!whatsappRegex.test(picWhatsapp)) {
      setFormError("Format No. PIC salah. Awali 628 (total 12-14 digit).");
      return;
    }
    // --- AKHIR VALIDASI ---

    // Panggil fungsi di App.jsx (dengan 3 parameter)
    onReportDamage(selectedItemToReport, issueDescription, picWhatsapp);

    setIsReportModalOpen(false);
    setSelectedItemToReport(null);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportHistoryToExcel = () => {
    if (monthlyHistory.length === 0)
      return alert(`Tidak ada data riwayat pada bulan ${exportMonth}`);
    const dataToExport = monthlyHistory.map((log) => ({
      "Tgl Lapor": formatDateTime(log.reportedAt),
      "Tgl Selesai": formatDateTime(log.finishedAt),
      "Nama Aset": log.itemName,
      "Kode Aset": log.itemCode,
      Kategori: log.category,
      "Status Akhir": log.finalStatus,
      "Masalah Awal": log.issue || "-",
      Penyelesaian: log.resolution || "-",
      "Diverifikasi Oleh": log.verifiedBy || "-",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 30 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Bulanan");
    XLSX.writeFile(wb, `Laporan_Selesai_${exportMonth}.xlsx`);
  };

  const getDuration = (timestamp) => {
    if (!timestamp) return "-";
    const diff = new Date().getTime() - timestamp;
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} Hari` : "Hari ini";
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Pusat Pelaporan</h2>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 px-2 border-r border-slate-300">
            <Calendar size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase">
              Filter Bulan:
            </span>
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            />
          </div>
          <button
            onClick={exportHistoryToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-2"
          >
            <FileText size={16} /> Export Excel
          </button>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-200 p-1 rounded-xl w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab("action")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "action"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CheckSquare size={16} /> Butuh Konfirmasi
          {actionItems.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {actionItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition ${
            activeTab === "active"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Aset Operasional ({operationalItems.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-white text-slate-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock size={16} /> Laporan Selesai ({monthlyHistory.length})
        </button>
      </div>

      {/* --- TAB 1: BUTUH KONFIRMASI --- */}
      {activeTab === "action" && (
        <div className="space-y-4">
          {actionItems.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl text-center border border-dashed border-slate-300 text-slate-400">
              <CheckCircle className="mx-auto mb-2 opacity-50" size={40} />
              <p>Tidak ada laporan yang perlu dikonfirmasi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-purple-500 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 text-lg">
                        {item.name}
                      </h4>
                      <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded uppercase">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      {item.code} • {item.location}
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg mb-2 text-sm text-slate-600 border border-slate-100">
                      <span className="font-bold text-red-500 block text-xs uppercase mb-1">
                        Masalah Awal:
                      </span>
                      "{item.issue || "-"}"
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm text-slate-600 border border-green-100">
                      <span className="font-bold text-green-600 block text-xs uppercase mb-1">
                        Laporan Teknisi:
                      </span>
                      "{item.notes}"
                    </div>
                  </div>
                  <button
                    onClick={() => onVerifyRepair(item)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
                  >
                    <CheckSquare size={18} /> Tindak Lanjuti
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: ASET OPERASIONAL (LAPOR KERUSAKAN) --- */}
      {activeTab === "active" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari aset operasional..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Nama Aset</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Lokasi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {operationalItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">
                      {item.name}{" "}
                      <span className="text-slate-400 text-xs font-normal">
                        ({item.code})
                      </span>
                    </td>
                    <td className="p-4 text-sm">{item.category}</td>
                    <td className="p-4 text-sm">{item.location}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openReportModal(item)}
                        className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        <AlertTriangle
                          size={14}
                          className="inline mb-0.5 mr-1"
                        />{" "}
                        Lapor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: RIWAYAT LAPORAN SELESAI (TAB BARU) --- */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {monthlyHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400 italic">
              Tidak ada laporan selesai pada bulan {exportMonth}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">Tgl Selesai</th>
                    <th className="p-4">Nama Aset</th>
                    <th className="p-4">Masalah Awal</th>
                    <th className="p-4">Penyelesaian</th>
                    <th className="p-4">Status Akhir</th>
                    <th className="p-4">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {monthlyHistory.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatDateTime(log.finishedAt)}
                      </td>
                      <td className="p-4 font-medium text-slate-800">
                        {log.itemName}
                        <div className="text-xs text-slate-400 font-normal">
                          {log.itemCode}
                        </div>
                      </td>
                      <td
                        className="p-4 text-red-600 max-w-xs truncate"
                        title={log.issue}
                      >
                        {log.issue}
                      </td>
                      <td
                        className="p-4 text-green-600 max-w-xs truncate"
                        title={log.resolution}
                      >
                        {log.resolution}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            log.finalStatus === "Operasional"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {log.finalStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{log.verifiedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL POPUP LAPOR KERUSAKAN (UPDATED) --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800">
                Lapor Kerusakan
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Aset:{" "}
              <span className="font-bold text-slate-700">
                {selectedItemToReport?.name}
              </span>
            </p>

            <div className="space-y-4">
              {/* 1. Input Masalah */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Detail Kendala / Masalah
                </label>
                <textarea
                  rows="3"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="Contoh: Layar mati total..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                ></textarea>
              </div>

              {/* 2. Input PIC (WhatsApp) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nomor PIC (WhatsApp)
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                  placeholder="6281234567890"
                  value={picWhatsapp}
                  onChange={(e) => setPicWhatsapp(e.target.value)}
                />
              </div>

              {/* Tampilkan Error Validasi */}
              {formError && (
                <p className="text-red-600 text-sm text-center font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                  {formError}
                </p>
              )}
            </div>

            <button
              onClick={submitReport}
              className="w-full py-3 mt-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex justify-center items-center gap-2"
            >
              <AlertTriangle size={18} /> Kirim Laporan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportingView;
