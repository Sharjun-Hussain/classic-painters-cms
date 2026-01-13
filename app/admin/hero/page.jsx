'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { 
  Save, Loader2, Image as ImageIcon, 
  Type, MousePointerClick, 
  CheckCircle2, AlertCircle, Smartphone, Monitor, RefreshCw 
} from 'lucide-react';

export default function HeroEditor() {
  // 1. STATE MANAGEMENT
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    description: '',
    bgImageUrl: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [galleryImages, setGalleryImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const iframeRef = useRef(null);

  // 2. FETCH DATA
  useEffect(() => {
    fetchHero();
    fetchGalleryImages();
  }, []);

  // 3. REAL-TIME BRIDGE (The Magic)
  // Whenever 'hero' state changes, send it to the iframe
  useEffect(() => {
    const sendToPreview = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'HERO_PREVIEW_UPDATE',
          data: hero
        }, '*'); // In production, replace '*' with your specific domain for security
      }
    };

    // Small delay to ensure iframe render cycle catches it
    const timeout = setTimeout(sendToPreview, 100);
    return () => clearTimeout(timeout);
  }, [hero]);

  const fetchHero = async () => {
    try {
      const res = await axios.get('/api/hero');
      if(res.data) setHero(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res = await axios.get('/api/gallery');
      setGalleryImages(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const saveHero = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      await axios.post('/api/hero', hero);
      setStatus({ type: 'success', message: 'Hero section published live!' });
      // Refresh iframe to confirm saved state
      if(iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition-all text-sm font-medium";
  const labelClass = "block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 z-20 shadow-sm">
        <div>
           <h1 className="text-xl font-bold text-slate-800">Hero Section Editor</h1>
           <p className="text-xs text-slate-500">Customize the first thing your visitors see: the homepage hero area.</p>
        </div>
        
        <div className="flex items-center gap-4">
            {status.message && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in ${
                    status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {status.message}
                </div>
            )}
            <button
                onClick={saveHero}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 font-medium text-sm"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'Publishing...' : 'Publish Changes'}
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: EDITOR SCROLLABLE */}
        <div className="w-[450px] border-r border-slate-200 overflow-y-auto bg-white p-6 space-y-8 shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            
            {/* Text Content */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Type className="text-blue-600" size={18} />
                    <h3 className="font-semibold text-slate-800">Typography</h3>
                </div>
                <div>
                    <label className={labelClass}>Headline</label>
                    <input
                        type="text"
                        value={hero.title || ''}
                        onChange={(e) => setHero({ ...hero, title: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Subtitle</label>
                    <textarea
                        value={hero.subtitle || ''}
                        onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                        className={`${inputClass} h-24 font-mono text-xs leading-relaxed`}
                    />
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        value={hero.description || ''}
                        onChange={(e) => setHero({ ...hero, description: e.target.value })}
                        className={`${inputClass} h-20`}
                    />
                </div>
            </div>

            {/* Visuals */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <ImageIcon className="text-purple-600" size={18} />
                    <h3 className="font-semibold text-slate-800">Media</h3>
                </div>
                <div>
                    <label className={labelClass}>Background Image</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={hero.bgImageUrl || ''}
                            onChange={(e) => setHero({ ...hero, bgImageUrl: e.target.value })}
                            className={`${inputClass}`}
                        />
                        <button
                            onClick={() => setShowImagePicker(!showImagePicker)}
                            className="bg-purple-50 text-purple-700 px-3 rounded-lg border border-purple-200 hover:bg-purple-100"
                        >
                            <ImageIcon size={18} />
                        </button>
                    </div>
                </div>
                
                {showImagePicker && (
                    <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                         {galleryImages.map((img, idx) => (
                            <div key={idx} onClick={() => { setHero({ ...hero, bgImageUrl: img.src }); setShowImagePicker(false); }} className="cursor-pointer aspect-square rounded-md overflow-hidden hover:opacity-80">
                                <img src={img.src} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <MousePointerClick className="text-green-600" size={18} />
                    <h3 className="font-semibold text-slate-800">Buttons</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primary Text</label>
                        <input type="text" value={hero.primaryBtnText} onChange={(e)=>setHero({...hero, primaryBtnText: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Link</label>
                        <input type="text" value={hero.primaryBtnLink} onChange={(e)=>setHero({...hero, primaryBtnLink: e.target.value})} className={inputClass} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Secondary Text</label>
                        <input type="text" value={hero.secondaryBtnText} onChange={(e)=>setHero({...hero, secondaryBtnText: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Link</label>
                        <input type="text" value={hero.secondaryBtnLink} onChange={(e)=>setHero({...hero, secondaryBtnLink: e.target.value})} className={inputClass} />
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: LIVE PREVIEW AREA */}
        <div className="flex-1 bg-slate-100 flex flex-col relative">
            
            {/* Toolbar */}
            <div className="h-12 bg-white border-b border-slate-200 flex justify-center items-center gap-4">
                <button 
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Monitor size={20} />
                </button>
                <button 
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Smartphone size={20} />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-2"></div>
                <button 
                    onClick={() => iframeRef.current.src = iframeRef.current.src}
                    className="text-slate-400 hover:text-slate-600"
                    title="Refresh Live Site"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 flex justify-center items-center p-8 overflow-hidden">
                <div className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden border border-slate-300 ${
                    previewDevice === 'mobile' 
                    ? 'w-[375px] h-[667px] rounded-3xl border-8 border-slate-800' 
                    : 'w-full h-full rounded-lg'
                }`}>
                    <iframe
                        ref={iframeRef}
                        src="https://classic-painters.vercel.app" // CHANGE THIS TO YOUR ACTUAL SITE URL
                        className="w-full h-full bg-white"
                        title="Live Preview"
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}