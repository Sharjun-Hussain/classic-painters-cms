'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { Save, Loader2 } from 'lucide-react';

const sectionsList = [
  { key: 'trust_bar', label: 'Trust Bar' },
  { key: 'why_choose_us', label: 'Why Choose Us' },
  { key: 'process', label: 'Process' },
  { key: 'before_after', label: 'Before & After' },
  { key: 'cta', label: 'Call To Action' },
  { key: 'contact', label: 'Contact Section' },
  { key: 'about', label: 'About Us' }
];

export default function SectionsPage() {
  const [activeSectionKey, setActiveSectionKey] = useState('trust_bar');
  const [sectionData, setSectionData] = useState({ title: '', content: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSection(activeSectionKey);
  }, [activeSectionKey]);

  const fetchSection = async (key) => {
    try {
      const res = await axios.get(`/api/section?key=${key}`);
      const data = res.data;
      if (typeof data.content === 'string') data.content = JSON.parse(data.content);
      setSectionData({ title: data.title || '', content: data.content || {} });
    } catch (error) {
      console.error(error);
      setSectionData({ title: '', content: {} });
    }
  };

  const saveSection = async () => {
    setSaving(true);
    try {
      await axios.post('/api/section', {
        key: activeSectionKey,
        title: sectionData.title,
        content: sectionData.content
      });
      alert('Section saved successfully!');
    } catch (error) {
      alert('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Content Sections" 
        description="Manage the text and layout of various sections across your website."
      />

      {/* Section Selector */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {sectionsList.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSectionKey(s.key)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeSectionKey === s.key 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section Editor */}
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={sectionData.title}
              onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Section title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (JSON)
            </label>
            <textarea
              value={JSON.stringify(sectionData.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setSectionData({ ...sectionData, content: parsed });
                } catch (e) {
                  // Allow typing
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-mono text-sm h-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Edit content structure as JSON. Be careful with syntax.
            </p>
          </div>

          <button
            onClick={saveSection}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
