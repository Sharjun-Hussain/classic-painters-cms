"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "../components/PageHeader";
import {
  Plus,
  Trash2,
  Loader2,
  Edit2,
  X,
  Image as ImageIcon,
  Dice5,
  ArrowRight,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";

const POPULAR_ICONS = [
  "Home",
  "Building2",
  "PaintBucket",
  "Layers",
  "Ruler",
  "Brush",
  "Wrench",
  "Zap",
  "Star",
  "Droplets",
  "Fence",
  "Hammer",
  "HardHat",
  "Roller",
  "Scissors",
  "Tool",
  "Truck",
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    bgImage: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Gallery Modal State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGalleryImages = async () => {
    if (galleryImages.length > 0) {
      setShowGalleryModal(true);
      return;
    }
    setLoadingGallery(true);
    try {
      const res = await axios.get("/api/gallery");
      setGalleryImages(res.data);
      setShowGalleryModal(true);
    } catch (error) {
      alert("Failed to load gallery images");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleRandomIcon = () => {
    const randomIcon =
      POPULAR_ICONS[Math.floor(Math.random() * POPULAR_ICONS.length)];
    setFormData((prev) => ({ ...prev, icon: randomIcon }));
  };

  const handleSelectImage = (url) => {
    setFormData((prev) => ({ ...prev, bgImage: url }));
    setShowGalleryModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put("/api/services", { ...formData, id: editingId });
      } else {
        await axios.post("/api/services", formData);
      }
      resetForm();
      fetchServices();
    } catch (error) {
      alert("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", icon: "", bgImage: "" });
    setEditingId(null);
  };

  const startEdit = (service) => {
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon || "",
      bgImage: service.bgImage || "",
    });
    setEditingId(service.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteService = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await axios.delete(`/api/services?id=${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Service Catalog"
          description="Define and manage the painting services you offer to your clients."
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* --- Left Side: The Editor Form --- */}
          <div className="lg:w-1/3 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Service" : "Create Service"}
                </h3>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Title Input */}
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400"
                    placeholder="e.g. Graphic Design"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400 resize-none"
                    rows={4}
                    placeholder="Write a short description..."
                  />
                </div>

                {/* Icon Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Icon (Lucide Name)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                      placeholder="e.g. PenTool"
                    />
                    <button
                      onClick={handleRandomIcon}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                      title="Random Icon"
                    >
                      <Dice5 size={20} />
                    </button>
                  </div>
                </div>

                {/* Image Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Cover Image
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.bgImage}
                      onChange={(e) =>
                        setFormData({ ...formData, bgImage: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none truncate"
                      placeholder="https://..."
                    />
                    <button
                      onClick={fetchGalleryImages}
                      className="absolute right-2 top-2 p-1.5 bg-white shadow-sm border border-gray-200 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      {loadingGallery ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : editingId ? (
                    <Edit2 size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {editingId ? "Save Changes" : "Add Service"}
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Side: The Grid --- */}
          <div className="lg:w-2/3 order-1 lg:order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Card Image Area */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {s.bgImage ? (
                      <img
                        src={s.bgImage}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <LayoutGrid size={48} />
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-2 bg-white/90 backdrop-blur text-indigo-600 rounded-lg hover:bg-white shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteService(s.id)}
                        className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-lg hover:bg-white shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Icon Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-white/20 shadow-lg">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        {s.icon || "Service"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {s.title}
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                      {s.description}
                    </p>

                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                      <span className="text-xs text-gray-400 font-mono">
                        ID: {s.id}
                      </span>
                      <button
                        onClick={() => startEdit(s)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
                      >
                        Edit Details
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover/btn:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <LayoutGrid size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">
                  Your catalog is empty
                </h3>
                <p className="text-gray-500 mt-1">
                  Use the form on the left to add your first service.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FIXED GALLERY MODAL --- */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select Image
                </h3>
                <p className="text-xs text-gray-500">
                  Choose an image from your library
                </p>
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 shadow-sm bg-white h-36"
                    onClick={() => handleSelectImage(img.src)}
                  >
                    <img
                      src={img.src}
                      alt={img.title || "Gallery"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = "none"; // Hide broken image
                        e.target.nextSibling.style.display = "flex"; // Show fallback
                      }}
                    />
                    {/* Hidden Fallback div that shows if image breaks */}
                    <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center flex-col text-gray-400 gap-1">
                      <AlertCircle size={24} />
                      <span className="text-[10px]">Broken Image</span>
                    </div>

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                ))}
              </div>

              {galleryImages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <ImageIcon className="text-gray-400" size={32} />
                  </div>
                  <p className="text-slate-900 font-medium">No images found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Upload images to your gallery to see them here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
