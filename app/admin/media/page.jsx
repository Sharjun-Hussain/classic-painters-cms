'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  X, FileImage, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Optimization Utility ---
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
          } else reject(new Error('Conversion failed'));
        }, 'image/webp', 0.8); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function MediaPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'Gallery', 'Branding'
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  
  // Deleting State
  const [deletingId, setDeletingId] = useState(null);

  // Viewer State
  const [viewerIndex, setViewerIndex] = useState(null);
  const isViewerOpen = viewerIndex !== null;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Fetch ALL images
      const res = await axios.get('/api/gallery?type=all');
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true;
    if (filter === 'Gallery') return img.category !== 'Branding' && img.category !== 'System';
    return img.category === filter;
  });

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: imageFiles.length });

    try {
      const newImages = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const optimizedFile = await convertToWebP(file);
        const formData = new FormData();
        formData.append('file', optimizedFile);
        // Default to 'Uncategorized' for general media uploads
        formData.append('category', 'Uncategorized'); 
        
        const res = await axios.post('/api/gallery', formData);
        newImages.push(res.data);
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      }
      setImages(prev => [...newImages, ...prev]); 
    } catch (error) {
      alert('Some uploads failed.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this image? This might break pages using it.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/gallery?id=${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
      if (isViewerOpen) setViewerIndex(null);
    } catch (error) {
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-slate-900">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Media Library</h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage all system assets, gallery images, and branding files.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="flex items-center bg-slate-100 rounded-lg p-1">
               {['all', 'Gallery', 'Branding'].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                     filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                   }`}
                 >
                   {f === 'all' ? 'All' : f}
                 </button>
               ))}
             </div>

             <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg">
               <Upload size={18} />
               <span>Upload</span>
               <input type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} accept="image/*" />
            </label>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
           <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-center gap-3 animate-pulse">
             <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
             <span className="text-blue-900 font-medium">Uploading {uploadProgress.current} / {uploadProgress.total}...</span>
           </div>
        )}

        {/* Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[...Array(12)].map((_, n) => <div key={n} className="aspect-square bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Filter className="w-12 h-12 mb-3 opacity-20" />
              <p>No media found matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredImages.map((img, index) => (
                <div 
                  key={img.id}
                  onClick={() => setViewerIndex(index)}
                  className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer border border-slate-200 hover:border-indigo-500 transition-colors"
                >
                  <img src={img.src} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDelete(e, img.id)}
                      className="bg-white text-red-500 p-1.5 rounded-md shadow-sm hover:bg-red-50"
                    >
                      {deletingId === img.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />}
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 text-[10px] font-medium text-slate-600 border-t border-slate-100 translate-y-full group-hover:translate-y-0 transition-transform">
                    {img.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simple Viewer */}
      {isViewerOpen && images[viewerIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setViewerIndex(null)}>
          <img src={images[viewerIndex].src} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={32} /></button>
        </div>
      )}
    </div>
  );
}
