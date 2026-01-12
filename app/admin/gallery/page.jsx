'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Upload, Trash2, Loader2, Image as ImageIcon, X, FileImage } from 'lucide-react';
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
        
        // Calculate new size (optional: max width 1920px to prevent massive uploads)
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
        
        // Convert to WebP with 0.8 quality (80%)
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new File object with .webp extension
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
  const [processingText, setProcessingText] = useState('');
  
  // Deleting State
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Assuming your API returns array of objects: { id, src, ... }
      const res = await axios.get('/api/gallery');
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Upload Logic ---
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    try {
      setUploading(true);
      
      // 1. Client-side Optimization
      setProcessingText('Optimizing image (WebP)...');
      const optimizedFile = await convertToWebP(file);
      
      // 2. Prepare Upload
      setProcessingText('Uploading to server...');
      const formData = new FormData();
      formData.append('file', optimizedFile);

      // 3. Send to API
      const res = await axios.post('/api/gallery', formData);
      
      // 4. Update State
      setImages(prev => [res.data, ...prev]); 
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProcessingText('');
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // --- Delete Logic ---
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    setDeletingId(id);
    
    try {
      await axios.delete(`/api/gallery?id=${id}`);
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Media Library</h1>
            <p className="text-slate-500 mt-1">Manage your website assets. Images are automatically optimized.</p>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className={cn(
            "relative group rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out p-10 text-center bg-white shadow-sm",
            isDragging ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-100" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            uploading && "opacity-80 pointer-events-none"
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto">
            <div className={cn("p-4 rounded-full bg-slate-100 transition-colors", isDragging && "bg-blue-100")}>
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className={cn("w-8 h-8 text-slate-400", isDragging && "text-blue-600")} />
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-700">
                {uploading ? processingText : 'Click or Drag to Upload'}
              </p>
              <p className="text-sm text-slate-500">
                Supports JPG, PNG (Auto-converts to WebP)
              </p>
            </div>

            {/* Hidden Input & Button */}
            {!uploading && (
              <label className="cursor-pointer mt-2">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileSelect(e.target.files?.[0])} 
                  accept="image/*"
                />
                <span className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-8 text-sm font-medium text-white hover:bg-slate-800 hover:scale-105 transition-all shadow-lg shadow-slate-200">
                  Select Image
                </span>
              </label>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        {/* Gallery Grid */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="aspect-square bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileImage className="w-12 h-12 mb-3 opacity-50" />
              <p>No images uploaded yet.</p>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              <AnimatePresence>
                {images.map((img) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={img.id}
                    className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-100 relative">
                      <img 
                        src={img.src} 
                        alt="Gallery upload"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Delete Button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                         <button 
                          onClick={() => handleDelete(img.id)}
                          disabled={deletingId === img.id}
                          className="bg-white/95 text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors shadow-sm backdrop-blur-sm"
                          title="Delete Image"
                        >
                          {deletingId === img.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>

                      {/* Info Badge */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <span className="text-[10px] font-medium text-white bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                           WEBP
                         </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}