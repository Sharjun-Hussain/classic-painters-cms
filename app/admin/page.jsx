'use client';

import Link from 'next/link';
import PageHeader from './components/PageHeader';
import { 
  Image as ImageIcon, 
  Layout, 
  List, 
  MessageSquare, 
  FileText, 
  Settings,
  ArrowRight
} from 'lucide-react';

const quickLinks = [
  { 
    href: '/admin/gallery', 
    label: 'Gallery', 
    icon: ImageIcon, 
    description: 'Manage images and categories',
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    href: '/admin/hero', 
    label: 'Hero Section', 
    icon: Layout, 
    description: 'Edit homepage hero content',
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    href: '/admin/services', 
    label: 'Services', 
    icon: List, 
    description: 'Add and manage services',
    color: 'bg-green-50 text-green-600'
  },
  { 
    href: '/admin/testimonials', 
    label: 'Testimonials', 
    icon: MessageSquare, 
    description: 'Customer reviews and feedback',
    color: 'bg-yellow-50 text-yellow-600'
  },
  { 
    href: '/admin/sections', 
    label: 'Page Sections', 
    icon: FileText, 
    description: 'Edit page content sections',
    color: 'bg-pink-50 text-pink-600'
  },
  { 
    href: '/admin/settings', 
    label: 'Site Settings', 
    icon: Settings, 
    description: 'Configure site-wide settings',
    color: 'bg-gray-50 text-gray-600'
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Welcome to your content management system"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <Icon size={24} />
                </div>
                <ArrowRight 
                  size={20} 
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {link.label}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">-</div>
            <div className="text-sm text-gray-600 mt-1">Gallery Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">-</div>
            <div className="text-sm text-gray-600 mt-1">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">-</div>
            <div className="text-sm text-gray-600 mt-1">Testimonials</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1</div>
            <div className="text-sm text-gray-600 mt-1">Admin Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}