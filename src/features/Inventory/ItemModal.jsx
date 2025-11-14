import React, { useState } from "react";
// PERBAIKAN DISINI: Menambahkan 'Plus' ke dalam import
import {
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { CATEGORY_OPTIONS } from "../../constants";

const ItemModal = ({ item, onClose, onSubmit, isVerificationMode = false }) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    code: item?.code || "",
    serialNumber: item?.serialNumber || "",
    category: item?.category || "Elektronik",
    location: item?.location || "",
    unitBisnis: item?.unitBisnis || "",
    user: item?.user || "",
    stockOpname: item?.stockOpname || "",
    whatsapp: item?.whatsapp || "",

    status: isVerificationMode ? "Operasional" : item?.status || "Aset Baru",

    notes: item?.notes || "",
    imageUrl: item?.imageUrl || "",

    hostName: item?.hostName || "",
    os: item?.os || "",
    specs: item?.specs || [],
    monitors: item?.monitors || [],
    nopol: item?.nopol || "",
    year: item?.year || "",
    brand: item?.brand || "",
    bpkb: item?.bpkb || "",
    stnk: item?.stnk || "",
    noMesin: item?.noMesin || "",
    noRangka: item?.noRangka || "",
    dimensions: item?.dimensions || "",
    material: item?.material || "",
  });

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(item?.imageUrl || null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [...prev.specs, { type: "CPU", description: "" }],
    }));
  };
  const removeSpec = (index) => {
    const newSpecs = [...formData.specs];
    newSpecs.splice(index, 1);
    setFormData((prev) => ({ ...prev, specs: newSpecs }));
  };
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = value;
    setFormData((prev) => ({ ...prev, specs: newSpecs }));
  };
  const addMonitor = () => {
    setFormData((prev) => ({
      ...prev,
      monitors: [
        ...prev.monitors,
        { display: "", serial: "", asset: "", code: "", stock: "" },
      ],
    }));
  };
  const removeMonitor = (index) => {
    const newMonitors = [...formData.monitors];
    newMonitors.splice(index, 1);
    setFormData((prev) => ({ ...prev, monitors: newMonitors }));
  };
  const handleMonitorChange = (index, field, value) => {
    const newMonitors = [...formData.monitors];
    newMonitors[index][field] = value;
    setFormData((prev) => ({ ...prev, monitors: newMonitors }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_PRESET
    );
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formDataUpload
      );
      setFormData((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
      setPreview(res.data.secure_url);
    } catch (error) {
      alert("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-2xl text-slate-800">
              {isVerificationMode
                ? "Tindak Lanjut Laporan"
                : item
                ? "Edit Data Aset"
                : "Tambah Aset Baru"}
            </h3>
            <p className="text-slate-500 text-sm">
              {isVerificationMode
                ? "Tentukan status akhir aset setelah perbaikan."
                : "Pastikan data yang dimasukkan valid"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          {isVerificationMode && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">
                  Masalah Awal (Admin)
                </span>
                <p className="text-sm text-slate-800 bg-white p-2 rounded border border-slate-200 mt-1">
                  {item?.issue || "-"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase">
                  Laporan Teknisi
                </span>
                <p className="text-sm text-slate-800 bg-white p-2 rounded border border-slate-200 mt-1">
                  {item?.notes || "-"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 h-full min-h-[200px]">
                {preview ? (
                  <div className="relative group w-full">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setFormData({ ...formData, imageUrl: "" });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon size={48} className="mb-2" />
                    <span className="text-xs text-center">
                      Upload Foto Aset
                    </span>
                  </div>
                )}
                <label className="mt-4 cursor-pointer bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2 shadow-sm">
                  <Upload size={16} />{" "}
                  {uploading ? "Uploading..." : "Pilih Gambar"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kategori</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isVerificationMode}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Status Aset</label>
                  {isVerificationMode ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input-field border-blue-500 ring-2 ring-blue-100"
                    >
                      <option value="Operasional">✅ Operasional</option>
                      <option value="Disposal">❌ Disposal</option>
                    </select>
                  ) : !item ? (
                    <input
                      value="Aset Baru"
                      disabled
                      className="input-field bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                    />
                  ) : (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="Aset Baru">Aset Baru</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Disposal">Disposal</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Nama Aset / Barang</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Laptop Dell / Toyota Avanza"
                  className="input-field uppercase"
                  disabled={isVerificationMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">No. Asset</label>
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="input-field uppercase"
                    disabled={isVerificationMode}
                  />
                </div>
                {!["Kendaraan", "Furniture", "Lainnya"].includes(
                  formData.category
                ) && (
                  <div>
                    <label className="label">Serial Number</label>
                    <input
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleChange}
                      className="input-field uppercase"
                      disabled={isVerificationMode}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Lokasi</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isVerificationMode}
                  />
                </div>
                <div>
                  <label className="label">Unit Bisnis</label>
                  <input
                    name="unitBisnis"
                    value={formData.unitBisnis}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isVerificationMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {!isVerificationMode && (
            <>
              <hr className="border-slate-100" />
              {formData.category === "Elektronik" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Host Name</label>
                      <input
                        name="hostName"
                        value={formData.hostName}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                    <div>
                      <label className="label">OS</label>
                      <input
                        name="os"
                        value={formData.os}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">User</label>
                      <input
                        name="user"
                        value={formData.user}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-bold text-sm text-slate-700">
                        Spesifikasi
                      </label>
                      <button
                        type="button"
                        onClick={addSpec}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold flex gap-1 items-center"
                      >
                        <Plus size={12} /> Tambah
                      </button>
                    </div>
                    {formData.specs.map((spec, i) => (
                      <div key={i} className="flex gap-3 mb-2 items-center">
                        <div className="w-40 shrink-0">
                          <select
                            value={spec.type}
                            onChange={(e) =>
                              handleSpecChange(i, "type", e.target.value)
                            }
                            className="input-field"
                            style={{ width: "100%" }}
                          >
                            <option value="CPU">CPU</option>
                            <option value="RAM">RAM</option>
                            <option value="Storage">Storage</option>
                            <option value="GPU">GPU</option>
                          </select>
                        </div>
                        <input
                          value={spec.description}
                          onChange={(e) =>
                            handleSpecChange(i, "description", e.target.value)
                          }
                          className="input-field flex-1 min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(i)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-bold text-sm text-slate-700">
                        Monitor
                      </label>
                      <button
                        type="button"
                        onClick={addMonitor}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold flex gap-1 items-center"
                      >
                        <Plus size={12} /> Tambah
                      </button>
                    </div>
                    {formData.monitors.map((mon, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 pb-3 border-b border-slate-200 last:border-0"
                      >
                        <input
                          value={mon.display}
                          onChange={(e) =>
                            handleMonitorChange(i, "display", e.target.value)
                          }
                          className="input-field"
                          placeholder="Merk"
                        />
                        <input
                          value={mon.serial}
                          onChange={(e) =>
                            handleMonitorChange(i, "serial", e.target.value)
                          }
                          className="input-field uppercase"
                          placeholder="SN"
                        />
                        <input
                          value={mon.asset}
                          onChange={(e) =>
                            handleMonitorChange(i, "asset", e.target.value)
                          }
                          className="input-field uppercase"
                          placeholder="No Asset"
                        />
                        <input
                          value={mon.code}
                          onChange={(e) =>
                            handleMonitorChange(i, "code", e.target.value)
                          }
                          className="input-field uppercase"
                          placeholder="IT Code"
                        />
                        <div className="flex gap-2">
                          <input
                            value={mon.stock}
                            onChange={(e) =>
                              handleMonitorChange(i, "stock", e.target.value)
                            }
                            className="input-field"
                            placeholder="Stock"
                          />
                          <button
                            type="button"
                            onClick={() => removeMonitor(i)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.category === "Kendaraan" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Merk</label>
                      <input
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">Tahun</label>
                      <input
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Nopol</label>
                      <input
                        name="nopol"
                        value={formData.nopol}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                    <div>
                      <label className="label">Mesin</label>
                      <input
                        name="noMesin"
                        value={formData.noMesin}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                    <div>
                      <label className="label">Rangka</label>
                      <input
                        name="noRangka"
                        value={formData.noRangka}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">BPKB</label>
                      <input
                        name="bpkb"
                        value={formData.bpkb}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                    <div>
                      <label className="label">STNK</label>
                      <input
                        name="stnk"
                        value={formData.stnk}
                        onChange={handleChange}
                        className="input-field uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
              {formData.category === "Furniture" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dimensi</label>
                    <input
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Material</label>
                    <input
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <hr className="border-slate-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">WhatsApp PIC</label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">
                Catatan {isVerificationMode ? "Verifikasi" : "Tambahan"}
              </label>
              <input
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </form>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition transform active:scale-95"
          >
            <Save size={18} />{" "}
            {isVerificationMode ? "Verifikasi & Simpan" : "Simpan Data"}
          </button>
        </div>
      </div>
      <style>{` .label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.4rem; } .input-field { width: 100%; padding: 0.7rem 1rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; font-size: 0.9rem; transition: all; } .input-field:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } `}</style>
    </div>
  );
};

export default ItemModal;
