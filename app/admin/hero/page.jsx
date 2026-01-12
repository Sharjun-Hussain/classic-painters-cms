'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';

export default function HeroPage() {
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
  const [galleryImages, setGalleryImages] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    fetchHero();
    fetchGalleryImages();
  }, []);

  const fetchHero = async () => {
    try {
      const res = await axios.get('/api/hero');
      setHero(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const res = await axios.get('/api/gallery');
      setGalleryImages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const saveHero = async () => {
    setSaving(true);
    try {
      await axios.post('/api/hero', hero);
      alert('Hero section saved successfully!');
    } catch (error) {
      alert('Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const selectImage = (imageUrl) => {
    setHero({ ...hero, bgImageUrl: imageUrl });
    setShowImagePicker(false);
  };

  return (
    <div className="max-w-4xl">
      <PageHeader 
        title="Hero Section" 
        description="Edit your homepage hero banner content and call-to-action buttons"
      />

      <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Title *
          </label>
          <input
            type="text"
            value={hero.title || ''}
            onChange={(e) => setHero({ ...hero, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Transform Your Space with Expert Painting"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle (Supports HTML)
          </label>
          <textarea
            value={hero.subtitle || ''}
            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 h-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Professional painting services for <strong>homes</strong> and <strong>businesses</strong>"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use <code className="bg-gray-100 px-1 rounded">&lt;strong&gt;</code> for bold text, 
            <code className="bg-gray-100 px-1 rounded ml-1">&lt;br/&gt;</code> for line breaks
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={hero.description || ''}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional description text..."
          />
        </div>

        <div className="h-px bg-gray-200" />

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image
          </label>
          
          {hero.bgImageUrl && (
            <div className="mb-3 relative group">
              <img 
                src={hero.bgImageUrl} 
                alt="Hero background preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setHero({ ...hero, bgImageUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ImageIcon size={18} />
              Select from Gallery
            </button>
            <input
              type="text"
              value={hero.bgImageUrl || ''}
              onChange={(e) => setHero({ ...hero, bgImageUrl: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Or paste image URL"
            />
          </div>

          {/* Image Picker */}
          {showImagePicker && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => selectImage(img.src)}
                    className="cursor-pointer group relative aspect-video overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500 transition-all"
                  >
                    <img 
                      src={img.src} 
                      alt={img.category}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
              {galleryImages.length === 0 && (
                <p className="text-center text-gray-500 py-8">No images in gallery. Upload some first!</p>
              )}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-200" />

        {/* Primary CTA Button */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Button Text
            </label>
            <input
              type="text"
              value={hero.primaryBtnText || ''}
              onChange={(e) => setHero({ ...hero, primaryBtnText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Get a Free Quote"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Button Link
            </label>
            <input
              type="text"
              value={hero.primaryBtnLink || ''}
              onChange={(e) => setHero({ ...hero, primaryBtnLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/contact"
            />
          </div>
        </div>

        {/* Secondary CTA Button */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Button Text
            </label>
            <input
              type="text"
              value={hero.secondaryBtnText || ''}
              onChange={(e) => setHero({ ...hero, secondaryBtnText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="View Our Work"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Button Link
            </label>
            <input
              type="text"
              value={hero.secondaryBtnLink || ''}
              onChange={(e) => setHero({ ...hero, secondaryBtnLink: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/gallery"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={saveHero}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Hero Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
