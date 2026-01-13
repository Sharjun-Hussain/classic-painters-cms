"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "../components/PageHeader";
import {
  Plus,
  Trash2,
  Loader2,
  MessageSquareQuote,
  User,
  Image as ImageIcon,
  X,
  AlertCircle,
  Quote,
  Pencil,
  RotateCcw
} from "lucide-react";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Gallery Modal State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("/api/testimonials");
      setTestimonials(res.data);
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

  const handleSelectImage = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setShowGalleryModal(false);
  };

  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.content,
      avatar: testimonial.avatar || "",
    });
    setEditingId(testimonial.id);
    setEditMode(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ name: "", role: "", content: "", avatar: "" });
    setEditingId(null);
    setEditMode(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.content) {
      alert("Please fill in name and content");
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        await axios.put("/api/testimonials", { ...formData, id: editingId });
      } else {
        await axios.post("/api/testimonials", formData);
      }
      
      setFormData({ name: "", role: "", content: "", avatar: "" });
      setEditMode(false);
      setEditingId(null);
      fetchTestimonials();
    } catch (error) {
      alert(`Failed to ${editMode ? 'update' : 'create'} testimonial`);
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(`/api/testimonials?id=${id}`);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="bg-gray-50/50 pb-24 w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Client Testimonials"
          description="Manage and display feedback from your satisfied customers."
        />

        <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* --- Left Column: Form --- */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
            <div className={`bg-white rounded-2xl shadow-sm border p-5 h-fit w-full transition-colors ${editMode ? 'border-indigo-200 ring-4 ring-indigo-50' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className={editMode ? "text-indigo-600" : "text-indigo-500"} size={20} />
                  <h3 className="text-base font-bold text-slate-900">
                    {editMode ? 'Edit Testimonial' : 'Add Testimonial'}
                  </h3>
                </div>
                {editMode && (
                  <button 
                    onClick={cancelEdit}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <RotateCcw size={12} /> Cancel
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400"
                      placeholder="Customer Name"
                    />
                  </div>
                </div>

                {/* Role Input */}
                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400"
                    placeholder="e.g. CEO, Tech Corp"
                  />
                </div>

                {/* Content Input */}
                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Review
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400 min-h-[100px] resize-none"
                    placeholder="Write the testimonial content here..."
                  />
                </div>

                {/* Avatar Input */}
                <div className="group">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                    Avatar Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) =>
                        setFormData({ ...formData, avatar: e.target.value })
                      }
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none truncate"
                      placeholder="https://..."
                    />
                    <button
                      onClick={fetchGalleryImages}
                      className="px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-lg transition-colors flex items-center justify-center"
                      title="Select from Gallery"
                    >
                      {loadingGallery ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`w-full mt-2 text-white font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none text-sm ${
                    editMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' 
                      : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : editMode ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editMode ? 'Update Testimonial' : 'Add Testimonial'}
                </button>
              </div>
            </div>
          </div>

          {/* --- Right Column: List --- */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white p-6 rounded-2xl shadow-sm border relative group hover:shadow-md transition-all h-fit break-inside-avoid ${
                    editingId === t.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100'
                  }`}
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(t.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <Quote
                    className="text-indigo-100 absolute top-6 left-6 -z-0"
                    size={48}
                  />

                  <div className="relative z-10">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 italic pt-2">
                      "{t.content}"
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                        {t.avatar ? (
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full items-center justify-center bg-indigo-50 text-indigo-500 ${
                            t.avatar ? "hidden" : "flex"
                          }`}
                        >
                          <User size={18} />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {t.name}
                        </h4>
                        {t.role && (
                          <p className="text-xs text-gray-500 font-medium">
                            {t.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 w-full">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                  <MessageSquareQuote className="text-gray-400" size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No Testimonials
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Add your first customer review on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Gallery Modal (Consistent Design) --- */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select Avatar
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
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center flex-col text-gray-400 gap-1">
                      <AlertCircle size={24} />
                      <span className="text-[10px]">Broken</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
