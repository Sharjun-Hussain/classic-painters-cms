'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', avatar: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get('/api/testimonials');
      setTestimonials(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createTestimonial = async () => {
    if (!newTestimonial.name || !newTestimonial.content) {
      alert('Please fill in name and content');
      return;
    }
    setSaving(true);
    try {
      await axios.post('/api/testimonials', newTestimonial);
      setNewTestimonial({ name: '', role: '', content: '', avatar: '' });
      fetchTestimonials();
    } catch (error) {
      alert('Failed to create testimonial');
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await axios.delete(`/api/testimonials?id=${id}`);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <PageHeader 
        title="Testimonials" 
        description="Manage customer reviews and feedback"
      />

      {/* Add New Testimonial */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Add New Testimonial</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={newTestimonial.name}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={newTestimonial.role}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Homeowner, Business Owner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={newTestimonial.content}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Testimonial content"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL
            </label>
            <input
              type="text"
              value={newTestimonial.avatar}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Avatar image URL"
            />
          </div>
          <button
            onClick={createTestimonial}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm relative group">
            <button
              onClick={() => deleteTestimonial(t.id)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={20} />
            </button>
            <p className="italic text-gray-600 mb-4">"{t.content}"</p>
            <div className="font-bold">{t.name}</div>
            {t.role && <div className="text-sm text-gray-500">{t.role}</div>}
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No testimonials added yet. Create your first testimonial above!</p>
        </div>
      )}
    </div>
  );
}
