import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

const MaintenanceView = ({ items, onResolve }) => {
  const brokenItems = items.filter(
    (i) => i.status === "Rusak" || i.status === "Perbaikan"
  );

  if (brokenItems.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
        <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-500" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Sistem Normal</h3>
        <p className="text-slate-500">
          Tidak ada peralatan yang perlu diperbaiki saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {brokenItems.map((item) => (
        <div
          key={item.id}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden"
        >
          <div
            className={`absolute top-0 left-0 w-1 h-full ${
              item.status === "Rusak" ? "bg-red-500" : "bg-yellow-500"
            }`}
          ></div>
          <div className="pl-4">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
              <span
                className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                  item.status === "Rusak"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              {item.code} - {item.location}
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic mb-4">
              "{item.notes || "Tidak ada catatan kerusakan"}"
            </div>
            <button
              onClick={() => onResolve(item)}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Tandai Selesai (Normal)
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaintenanceView;
