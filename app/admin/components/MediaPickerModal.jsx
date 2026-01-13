'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/gallery?type=all');
      setImages(res.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img => {
    const matchesSearch = img.title?.toLowerCase().includes(search.toLowerCase()) || 
                          img.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : img.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="text-indigo-500" size={20} />
              Select Media
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search images..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Branding">Branding</option>
              <option value="Gallery">Gallery</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <ImageIcon size={48} className="mb-2 opacity-20" />
                <p>No images found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredImages.map((img) => (
                  <div 
                    key={img.id}
                    onClick={() => {
                      onSelect(img.src);
                      onClose();
                    }}
                    className="group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 transition-all"
                  >
                    <img src={img.src} alt={img.title} className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-1.5 text-[10px] text-center truncate border-t border-slate-100">
                      {img.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
