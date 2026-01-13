'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  X, FileImage, ChevronLeft, ChevronRight, Pencil, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import MediaPickerModal from '../components/MediaPickerModal';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const convertToWebP = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1920; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Conversion failed'));
          }
        }, 'image/webp', 0.8); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  // Edit State
  const [editingImage, setEditingImage] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', projectName: '', category: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Deleting State
  const [deletingId, setDeletingId] = useState(null);

  // Viewer State
  const [viewerIndex, setViewerIndex] = useState(null);
  const isViewerOpen = viewerIndex !== null;

  // Media Picker
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Services State
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchImages();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isViewerOpen) return;
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft') navigateImage(-1);
      if (e.key === 'ArrowRight') navigateImage(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, viewerIndex]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gallery');
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files.');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: imageFiles.length });

    try {
      const newImages = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const optimizedFile = await convertToWebP(file);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        
        // Default values
        formData.append('category', 'Portfolio');
        formData.append('title', file.name.split('.')[0]); 
        
        const res = await axios.post('/api/gallery', formData);
        newImages.push(res.data);
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      setImages(prev => [...newImages, ...prev]); 
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Some uploads failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleMediaSelect = async (url) => {
    try {
        setUploading(true);
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "selected-image.webp", { type: "image/webp" });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'Portfolio');
        
        const apiRes = await axios.post('/api/gallery', formData);
        setImages(prev => [apiRes.data, ...prev]);
        setShowMediaPicker(false);
    } catch (error) {
        console.error("Failed to add from library", error);
        alert("Failed to add image from library");
    } finally {
        setUploading(false);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this image?')) return;
    setDeletingId(id);
    
    try {
      await axios.delete(`/api/gallery?id=${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (isViewerOpen) closeViewer();
    } catch (error) {
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (e, img) => {
    e.stopPropagation();
    setEditingImage(img);
    setEditForm({
        title: img.title || '',
        projectName: img.projectName || '',
        category: img.category || 'Portfolio'
    });
  };

  const handleUpdate = async () => {
    if (!editingImage) return;
    setSavingEdit(true);
    try {
        const res = await axios.put('/api/gallery', {
            id: editingImage.id,
            ...editForm
        });
        
        setImages(prev => prev.map(img => img.id === editingImage.id ? res.data : img));
        setEditingImage(null);
    } catch (error) {
        console.error(error);
        alert("Failed to update image details");
    } finally {
        setSavingEdit(false);
    }
  };

  const openViewer = (index) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);
  
  const navigateImage = (direction) => {
    setViewerIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-slate-900">
      <div className="w-full space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Portfolio Gallery</h1>
            <p className="text-slate-500 mt-2 text-lg">
              Showcase your best work with high-quality images and project details.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
                onClick={() => setShowMediaPicker(true)}
                className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
            >
                <ImageIcon size={20} />
                <span>From Library</span>
            </button>
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-105">
                <Upload size={20} />
                <span>Upload New</span>
                <input 
                    type="file" 
                    multiple
                    className="hidden" 
                    onChange={(e) => handleFiles(e.target.files)} 
                    accept="image/*"
                />
            </label>
          </div>
        </div>

        {uploading ? (
           <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center animate-pulse">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
             <p className="font-semibold text-blue-900">Processing...</p>
             <p className="text-blue-600/80 text-sm">
                Adding images to gallery...
             </p>
           </div>
        ) : (
          <div 
            className={cn(
              "w-full transition-all duration-300 ease-in-out rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3",
              isDragging 
                ? "border-blue-500 bg-blue-50/50 py-16" 
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50 py-12 text-slate-400 hover:text-slate-600"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <div className="pointer-events-none flex flex-col items-center">
              <Upload className={cn("w-10 h-10 mb-2 transition-colors", isDragging && "text-blue-600")} />
              <p className="font-medium">Drop multiple files here to upload instantly</p>
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, n) => (
                <div key={n} className="aspect-[4/3] bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-slate-50 rounded-2xl">
              <FileImage className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Gallery is empty</p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence>
                {images.map((img, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    key={img.id}
                    onClick={() => openViewer(index)}
                    className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                        <img 
                        src={img.src} 
                        alt={img.title || "Gallery item"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button 
                                onClick={(e) => openEdit(e, img)}
                                className="bg-white text-indigo-600 p-1.5 rounded-full shadow-sm hover:bg-indigo-50 transition-colors"
                            >
                                <Pencil size={14} />
                            </button>
                            <button 
                                onClick={(e) => handleDelete(e, img.id)}
                                disabled={deletingId === img.id}
                                className="bg-white text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                            >
                                {deletingId === img.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-3">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{img.projectName || 'Untitled Project'}</h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{img.title || 'No SEO Title'}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Image Details</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Name</label>
                        <input 
                            type="text" 
                            value={editForm.projectName} 
                            onChange={(e) => setEditForm({...editForm, projectName: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="e.g. Modern Villa Renovation"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEO Title (Alt Text)</label>
                        <input 
                            type="text" 
                            value={editForm.title} 
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            placeholder="e.g. Exterior House Painting in Auckland"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <select 
                            value={editForm.category} 
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            <option value="">Select Category</option>
                            {services.map(service => (
                                <option key={service.id} value={service.title}>{service.title}</option>
                            ))}
                            <option value="Portfolio">Portfolio</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button 
                        onClick={() => setEditingImage(null)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={savingEdit}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal 
        isOpen={showMediaPicker} 
        onClose={() => setShowMediaPicker(false)} 
        onSelect={handleMediaSelect} 
      />

      <AnimatePresence>
        {isViewerOpen && images[viewerIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            <button 
              onClick={closeViewer}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors z-50"
            >
              <X size={24} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white shadow-xl hover:scale-110 transition-transform text-slate-900 border border-slate-100 z-50 hidden md:block"
            >
              <ChevronLeft size={32} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white shadow-xl hover:scale-110 transition-transform text-slate-900 border border-slate-100 z-50 hidden md:block"
            >
              <ChevronRight size={32} />
            </button>

            <motion.div 
              key={viewerIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative w-full h-full p-4 md:p-12 flex items-center justify-center"
              onClick={closeViewer}
            >
              <img 
                src={images[viewerIndex].src} 
                alt={images[viewerIndex].title || "Full View"}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-lg text-sm font-medium text-slate-600">
                {viewerIndex + 1} / {images.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}