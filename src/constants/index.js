export const ROLES = {
  ADMIN: "admin",
  TEKNISI: "teknisi",
  MANAGER: "manager",
};

export const STATUS_COLORS = {
  "Aset Baru": "#3B82F6", // Biru (New)
  Operasional: "#10B981", // Hijau (Active)
  Rusak: "#EF4444", // Merah (Reported)
  "Sedang Diperbaiki": "#F59E0B", // Kuning (In Progress)
  "Selesai Diperbaiki": "#8B5CF6", // Ungu (Resolved - Waiting Admin)
  "Rusak Total": "#6B7280", // Abu Gelap (Dead - Waiting Admin)
  Disposal: "#000000", // Hitam (Gone)
};

export const STATUS_OPTIONS = Object.keys(STATUS_COLORS);

export const CATEGORY_OPTIONS = [
  "Elektronik",
  "Furniture",
  "Kendaraan",
  "Lainnya",
];
