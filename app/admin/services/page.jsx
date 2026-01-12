'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ title: '', description: '', icon: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createService = async () => {
    if (!newService.title || !newService.description) {
      alert('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await axios.post('/api/services', newService);
      setNewService({ title: '', description: '', icon: '' });
      fetchServices();
    } catch (error) {
      alert('Failed to create service');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await axios.delete(`/api/services?id=${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <PageHeader 
        title="Services" 
        description="Manage your service offerings"
      />

      {/* Add New Service */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Add New Service</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={newService.title}
              onChange={(e) => setNewService({ ...newService, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Service title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Service description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon (Lucide Icon Name)
            </label>
            <input
              type="text"
              value={newService.icon}
              onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Paintbrush, Home, Wrench"
            />
          </div>
          <button
            onClick={createService}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Add Service
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm relative group">
            <button
              onClick={() => deleteService(s.id)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-bold text-lg mb-2 pr-8">{s.title}</h3>
            <p className="text-gray-600 text-sm">{s.description}</p>
            {s.icon && (
              <span className="text-xs text-blue-500 mt-2 block">Icon: {s.icon}</span>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No services added yet. Create your first service above!</p>
        </div>
      )}
    </div>
  );
}
