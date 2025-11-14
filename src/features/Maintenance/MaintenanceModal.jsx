import React, { useState } from "react";
import { X, Save, Wrench } from "lucide-react";

// OPSI KHUSUS TEKNISI
const TECH_STATUS_OPTIONS = [
  "Sedang Diperbaiki",
  "Selesai Diperbaiki",
  "Rusak Total",
];

const MaintenanceModal = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Default ke 'Sedang Diperbaiki' jika status sebelumnya 'Rusak'
    status: item?.status === "Rusak" ? "Sedang Diperbaiki" : item?.status,
    notes: item?.notes || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-yellow-50">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">
                Update Perbaikan
              </h3>
              <p className="text-xs text-slate-500">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Status Pengerjaan
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TECH_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Laporan Teknis
            </label>
            <textarea
              rows="4"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Sparepart apa yang diganti? Apa kendalanya?"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Save size={18} /> Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
