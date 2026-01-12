'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({ navbarLinks: [], footerText: '', socialLinks: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      const data = res.data;
      if (typeof data.navbarLinks === 'string') data.navbarLinks = JSON.parse(data.navbarLinks);
      if (typeof data.socialLinks === 'string') data.socialLinks = JSON.parse(data.socialLinks);
      setSettings({
        navbarLinks: data.navbarLinks || [],
        footerText: data.footerText || '',
        socialLinks: data.socialLinks || {}
      });
    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post('/api/settings', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Site Settings" 
        description="Configure site-wide settings and navigation"
      />

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Text
            </label>
            <textarea
              value={settings.footerText || ''}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Footer text content"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Navbar Links (JSON)
            </label>
            <textarea
              value={JSON.stringify(settings.navbarLinks, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setSettings({ ...settings, navbarLinks: parsed });
                } catch (e) {
                  // Allow typing
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">

            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Links (JSON)
            </label>
            <textarea
              value={JSON.stringify(settings.socialLinks, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setSettings({ ...settings, socialLinks: parsed });
                } catch (e) {
                  // Allow typing
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
          
            </p>
          </div>

          <button
            onClick={saveSettings}
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
