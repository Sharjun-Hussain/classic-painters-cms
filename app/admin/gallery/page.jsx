'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, Trash2, Loader2, Image as ImageIcon, 
  X, FileImage, ChevronLeft, ChevronRight, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Optimization Utility: Convert to WebP ---
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
        
        // Max width 1920px
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
  
  // Deleting State
  const [deletingId, setDeletingId] = useState(null);

  // Viewer/Slider State
  const [viewerIndex, setViewerIndex] = useState(null);
  const isViewerOpen = viewerIndex !== null;

  useEffect(() => {
    fetchImages();
  }, []);

  // --- Keyboard Navigation for Slider ---
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
      // Mock API call - replace with actual endpoint
      const res = await axios.get('/api/gallery');
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Multi-Upload Logic ---
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    // Filter images only
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files.');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: imageFiles.length });

    try {
      // Process files sequentially or in small batches to prevent freezing
      // Here we do a simple loop for clarity
      const newImages = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // 1. Optimize
        const optimizedFile = await convertToWebP(file);
        
        // 2. Upload
        const formData = new FormData();
        formData.append('file', optimizedFile);
        
        const res = await axios.post('/api/gallery', formData);
        newImages.push(res.data);
        
        // Update progress
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
      }
      
      // Prepend new images
      setImages(prev => [...newImages, ...prev]); 
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Some uploads failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
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

  // --- Delete Logic ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent opening viewer
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

  // --- Viewer Logic ---
  const openViewer = (index) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(null);
  
  const navigateImage = (direction) => {
    setViewerIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return images.length - 1; // Loop to end
      if (newIndex >= images.length) return 0; // Loop to start
      return newIndex;
    });
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-slate-900">
      <div className="w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Media Library</h1>
            <p className="text-slate-500 mt-2 text-lg">
              {images.length} assets • WebP Optimized • Full Resolution
            </p>
          </div>
          
          {/* Upload Button (Triggers input) */}
          <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-105">
             <Upload size={20} />
             <span>Upload Images</span>
             <input 
                type="file" 
                multiple
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)} 
                accept="image/*"
              />
          </label>
        </div>

        {/* Drag & Drop Area (Collapsible or Full width banner style) */}
        {uploading ? (
           <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center animate-pulse">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
             <p className="font-semibold text-blue-900">Processing Uploads...</p>
             <p className="text-blue-600/80 text-sm">
                Optimizing & Uploading {uploadProgress.current} of {uploadProgress.total}
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

        {/* Gallery Grid - Full Width Layout */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1" // Gap-1 for a tight masonry-like feel, or gap-4 for breathing room
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
                    className="group relative aspect-square bg-slate-100 overflow-hidden cursor-zoom-in"
                  >
                    <img 
                      src={img.src} 
                      alt="Gallery item"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button 
                        onClick={(e) => handleDelete(e, img.id)}
                        disabled={deletingId === img.id}
                        className="bg-white text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                      >
                        {deletingId === img.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* --- Lightbox / Slider Overlay --- */}
      <AnimatePresence>
        {isViewerOpen && images[viewerIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Close Button */}
            <button 
              onClick={closeViewer}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors z-50"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
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

            {/* Main Image */}
            <motion.div 
              key={viewerIndex} // Key change triggers animation
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative w-full h-full p-4 md:p-12 flex items-center justify-center"
              onClick={closeViewer} // Click background to close
            >
              <img 
                src={images[viewerIndex].src} 
                alt="Full View"
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                onClick={(e) => e.stopPropagation()} // Click image shouldn't close
              />
              
              {/* Image Counter */}
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