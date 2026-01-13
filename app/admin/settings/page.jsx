"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "../components/PageHeader";
import MediaPickerModal from "../components/MediaPickerModal";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Mail,
  Phone,
  MapPin,
  Layout,
  Paintbrush,
  Upload,
  X,
  Image as ImageIcon,
  Maximize,
} from "lucide-react";

// --- Styled Components / Helpers ---

const SectionCard = ({ title, icon: Icon, children, description }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit w-full transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between mb-4 border-b border-gray-50 pb-3">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {Icon && <Icon className="text-indigo-500" size={18} />}
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

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

const ImageUploader = ({ label, value, onChange, recommendedSize, width, setWidth, height, setHeight }) => {
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const optimizedFile = await convertToWebP(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);
      formData.append('category', 'Branding'); 

      const res = await axios.post('/api/gallery', formData);
      onChange(res.data.src);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group border-b border-gray-50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
          {label}
        </label>
      </div>
      
      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="relative w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-contain p-1" 
              style={{ width: width || '100%', height: height || '100%' }}
            />
          ) : (
            <ImageIcon className="text-gray-300" size={24} />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="text-white animate-spin" size={20} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-3">
           <div className="flex flex-wrap gap-2">
             <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm">
               <Upload size={14} />
               Upload
               <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
             </label>
             
             <button 
                onClick={() => setShowPicker(true)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
             >
               <ImageIcon size={14} />
               Library
             </button>

             {value && (
               <button 
                 onClick={() => onChange('')}
                 className="text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors"
               >
                 <X size={16} />
               </button>
             )}
           </div>
           
           {/* Dimensions Inputs */}
           {(setWidth && setHeight) && (
             <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Width</label>
                  <input 
                    type="text" 
                    value={width || ''} 
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 150px"
                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Height</label>
                  <input 
                    type="text" 
                    value={height || ''} 
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. auto"
                    className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
             </div>
           )}
           
           {recommendedSize && (
             <p className="text-[10px] text-gray-400 leading-relaxed">
               <span className="font-semibold text-gray-500">Recommended:</span> {recommendedSize}
             </p>
           )}
        </div>
      </div>

      <MediaPickerModal 
        isOpen={showPicker} 
        onClose={() => setShowPicker(false)} 
        onSelect={(url) => onChange(url)} 
      />
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 py-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- Sub-Components ---

const LinkListEditor = ({ title, links, onChange }) => {
  const addLink = () => {
    onChange([...links, { label: "", url: "" }]);
  };

  const updateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    onChange(newLinks);
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </label>
        <button
          onClick={addLink}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {links.map((link, index) => (
          <div
            key={index}
            className="flex gap-2 items-start group animate-in fade-in slide-in-from-top-1 duration-200"
          >
            <input
              type="text"
              value={link.label}
              onChange={(e) => updateLink(index, "label", e.target.value)}
              placeholder="Label"
              className="flex-1 min-w-[30%] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
            <input
              type="text"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              placeholder="URL"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono text-xs"
            />
            <button
              onClick={() => removeLink(index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-medium">
              No links added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SocialLinksEditor = ({ links, onChange }) => {
  const platforms = [
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { name: "Instagram", icon: Instagram, color: "text-pink-600" },
    { name: "Linkedin", icon: Linkedin, color: "text-blue-700" },
    { name: "Twitter", icon: Twitter, color: "text-sky-500" },
    { name: "Youtube", icon: Youtube, color: "text-red-600" },
  ];

  const updatePlatform = (platform, value) => {
    const newLinks = { ...links };
    if (value) {
      newLinks[platform] = value;
    } else {
      delete newLinks[platform];
    }
    onChange(newLinks);
  };

  return (
    <div className="space-y-2">
      {platforms.map((p) => {
        const Icon = p.icon;
        return (
          <div key={p.name} className="relative group">
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${p.color} opacity-70 group-focus-within:opacity-100 transition-opacity`}
            >
              <Icon size={16} />
            </div>
            <input
              type="text"
              value={links[p.name] || ""}
              onChange={(e) => updatePlatform(p.name, e.target.value)}
              placeholder={`${p.name} URL`}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        );
      })}
    </div>
  );
};

// --- Main Component ---

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    navbarLinks: [],
    footerText: "",
    socialLinks: {},
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    quickLinks: [],
    logo: "",
    favicon: "",
    headerLogo: "",
    headerLogoWidth: "",
    headerLogoHeight: "",
    footerLogo: "",
    footerLogoWidth: "",
    footerLogoHeight: "",
    navbarCtaText: "",
    navbarCtaLink: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/settings");
      const data = res.data;

      const parseJSON = (val, fallback) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch (e) {
            return fallback;
          }
        }
        return val || fallback;
      };

      setSettings({
        navbarLinks: parseJSON(data.navbarLinks, []),
        footerText: data.footerText || "",
        socialLinks: parseJSON(data.socialLinks, {}),
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        contactAddress: data.contactAddress || "",
        quickLinks: parseJSON(data.quickLinks, []),
        logo: data.logo || "",
        favicon: data.favicon || "",
        headerLogo: data.headerLogo || "",
        headerLogoWidth: data.headerLogoWidth || "",
        headerLogoHeight: data.headerLogoHeight || "",
        footerLogo: data.footerLogo || "",
        footerLogoWidth: data.footerLogoWidth || "",
        footerLogoHeight: data.footerLogoHeight || "",
        navbarCtaText: data.navbarCtaText || "",
        navbarCtaLink: data.navbarCtaLink || "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.post("/api/settings", settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50/50 pb-24 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Global Settings"
          description="Configure site-wide branding, contact information, and navigation."
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* --- Left Column --- */}
          <div className="space-y-4 w-full">
            <SectionCard
              title="Branding"
              icon={Paintbrush}
              description="Logos and Icons"
            >
              <ImageUploader
                label="Header Logo"
                value={settings.headerLogo || settings.logo}
                onChange={(val) => setSettings({ ...settings, headerLogo: val })}
                width={settings.headerLogoWidth}
                setWidth={(val) => setSettings({ ...settings, headerLogoWidth: val })}
                height={settings.headerLogoHeight}
                setHeight={(val) => setSettings({ ...settings, headerLogoHeight: val })}
                recommendedSize="Transparent PNG/SVG"
              />
              
              <ImageUploader
                label="Footer Logo"
                value={settings.footerLogo || settings.logo}
                onChange={(val) => setSettings({ ...settings, footerLogo: val })}
                width={settings.footerLogoWidth}
                setWidth={(val) => setSettings({ ...settings, footerLogoWidth: val })}
                height={settings.footerLogoHeight}
                setHeight={(val) => setSettings({ ...settings, footerLogoHeight: val })}
                recommendedSize="Transparent PNG/SVG"
              />

              <ImageUploader
                label="Favicon"
                value={settings.favicon}
                onChange={(val) => setSettings({ ...settings, favicon: val })}
                recommendedSize="32x32px (ICO/PNG)"
              />
            </SectionCard>

            <SectionCard
              title="General Content"
              icon={Layout}
              description="Footer content"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Footer Text
                </label>
                <textarea
                  value={settings.footerText}
                  onChange={(e) =>
                    setSettings({ ...settings, footerText: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400 min-h-[80px] text-sm"
                  placeholder="e.g. © 2024 My Company."
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Contact Info"
              icon={MapPin}
              description="Displayed on footers"
            >
              <InputField
                label="Email Address"
                icon={Mail}
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings({ ...settings, contactEmail: e.target.value })
                }
                placeholder="hello@example.com"
                type="email"
              />
              <InputField
                label="Phone Number"
                icon={Phone}
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings({ ...settings, contactPhone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
              />
              <InputField
                label="Address"
                icon={MapPin}
                value={settings.contactAddress}
                onChange={(e) =>
                  setSettings({ ...settings, contactAddress: e.target.value })
                }
                placeholder="123 Innovation Dr"
              />
            </SectionCard>
          </div>

          {/* --- Right Column --- */}
          <div className="space-y-4 w-full">
            <SectionCard
              title="Navigation Menu"
              icon={LinkIcon}
              description="Main links"
            >
              <LinkListEditor
                title="Main Navbar"
                links={settings.navbarLinks}
                onChange={(newLinks) =>
                  setSettings({ ...settings, navbarLinks: newLinks })
                }
              />

              <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">CTA Button</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    label="Button Text"
                    value={settings.navbarCtaText}
                    onChange={(e) => setSettings({ ...settings, navbarCtaText: e.target.value })}
                    placeholder="e.g. Get a Quote"
                  />
                  <InputField
                    label="Button Link"
                    value={settings.navbarCtaLink}
                    onChange={(e) => setSettings({ ...settings, navbarCtaLink: e.target.value })}
                    placeholder="e.g. #contact"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <LinkListEditor
                  title="Footer Quick Links"
                  links={settings.quickLinks}
                  onChange={(newLinks) =>
                    setSettings({ ...settings, quickLinks: newLinks })
                  }
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Social Profiles"
              icon={Globe}
              description="Social links"
            >
              <SocialLinksEditor
                links={settings.socialLinks}
                onChange={(newLinks) =>
                  setSettings({ ...settings, socialLinks: newLinks })
                }
              />
            </SectionCard>
          </div>
        </div>
      </div>

      {/* --- Floating Save Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <p className="text-xs text-gray-500 hidden sm:block">
            Unsaved changes will be lost.
          </p>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="ml-auto sm:ml-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-slate-900/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:transform-none text-sm"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
