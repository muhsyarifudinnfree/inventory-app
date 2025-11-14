import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Monitor,
  Sofa,
  Car,
  Box,
} from "lucide-react";
import { STATUS_COLORS, CATEGORY_OPTIONS } from "../../constants";

const StatCard = ({ icon: Icon, color, label, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-2xl ${color}`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const CategoryStatCard = ({ title, icon: Icon, stats, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4 mb-5">
      <div className={`p-3 rounded-xl ${color.bg} ${color.text} shadow-sm`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg text-slate-800">{title}</h3>
    </div>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
        <span className="text-slate-500">Total Aset</span>
        <span className="font-bold text-slate-800 text-base">
          {stats.total}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 flex items-center gap-1.5">
          <CheckCircle size={14} className="text-green-500" /> Operasional
        </span>
        <span className="font-bold text-green-600">{stats.Operasional}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 flex items-center gap-1.5">
          <Wrench size={14} className="text-yellow-500" /> Perbaikan
        </span>
        <span className="font-bold text-yellow-600">{stats.Perbaikan}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-red-500" /> Rusak
        </span>
        <span className="font-bold text-red-600">{stats.Rusak}</span>
      </div>
    </div>
  </div>
);

const DashboardStats = ({ items }) => {
  const categoryDisplay = {
    Elektronik: {
      icon: Monitor,
      color: { bg: "bg-blue-50", text: "text-blue-600" },
    },
    Furniture: {
      icon: Sofa,
      color: { bg: "bg-orange-50", text: "text-orange-600" },
    },
    Kendaraan: {
      icon: Car,
      color: { bg: "bg-cyan-50", text: "text-cyan-600" },
    },
    Lainnya: {
      icon: Box,
      color: { bg: "bg-slate-50", text: "text-slate-600" },
    },
  };

  const summaryStats = useMemo(
    () => ({
      total: items.length,
      operasional: items.filter((i) => i.status === "Operasional").length,
      perbaikan: items.filter((i) => i.status === "Perbaikan").length,
      rusak: items.filter((i) => i.status === "Rusak").length,
    }),
    [items]
  );

  const categoryStats = useMemo(() => {
    const stats = {};
    CATEGORY_OPTIONS.forEach((cat) => {
      stats[cat] = {
        total: 0,
        Operasional: 0,
        Perbaikan: 0,
        Rusak: 0,
        Disposal: 0,
      };
    });
    items.forEach((item) => {
      if (stats[item.category]) {
        stats[item.category].total++;
        if (stats[item.category][item.status])
          stats[item.category][item.status]++;
      }
    });
    return stats;
  }, [items]);

  const statusData = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.status || "Lainnya"] = (acc[item.status || "Lainnya"] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(STATUS_COLORS).map((key) => ({
      name: key,
      value: counts[key] || 0,
      color: STATUS_COLORS[key],
    }));
  }, [items]);

  const categoryData = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.category || "Uncategorized"] =
        (acc[item.category || "Uncategorized"] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts)
      .map((key) => ({ name: key, jumlah: counts[key] }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [items]);

  return (
    <div className="space-y-8 animate-fade-in">
      <h3 className="font-bold text-lg text-slate-800 -mb-4">
        Ringkasan Total
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          color="bg-blue-50 text-blue-600"
          label="Total Aset"
          value={summaryStats.total}
        />
        <StatCard
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
          label="Operasional"
          value={summaryStats.operasional}
        />
        <StatCard
          icon={Wrench}
          color="bg-yellow-50 text-yellow-600"
          label="Perbaikan"
          value={summaryStats.perbaikan}
        />
        <StatCard
          icon={AlertTriangle}
          color="bg-red-50 text-red-600"
          label="Rusak"
          value={summaryStats.rusak}
        />
      </div>

      <h3 className="font-bold text-lg text-slate-800 -mb-4">
        Rincian per Kategori
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORY_OPTIONS.map((category) => (
          <CategoryStatCard
            key={category}
            title={category}
            icon={categoryDisplay[category].icon}
            color={categoryDisplay[category].color}
            stats={categoryStats[category]}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800">
            Ringkasan Status Total
          </h3>
          <ResponsiveContainer width="100%" height="90%" minWidth={0}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800">
            Total Aset per Kategori
          </h3>
          <ResponsiveContainer width="100%" height="90%" minWidth={0}>
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#475569" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="jumlah"
                fill="#3B82F6"
                radius={[0, 6, 6, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
