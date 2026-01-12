'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Layout, 
  List, 
  MessageSquare, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/hero', label: 'Hero Section', icon: Layout },
  { href: '/admin/services', label: 'Services', icon: List },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/admin/sections', label: 'Page Sections', icon: FileText },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

function Tooltip({ children, text, show }) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 12 // 12px gap
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!show) return children;

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>
      {mounted && isVisible && createPortal(
        <div 
          className="fixed z-[9999] px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl animate-fade-in pointer-events-none border border-slate-700/50"
          style={{ 
            top: `${coords.top}px`, 
            left: `${coords.left}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {text}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out z-30 shadow-2xl flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Toggle */}
      <div className={`h-16 min-h-[4rem] flex items-center border-b border-slate-700/50 transition-all duration-300 ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
        
        {/* Logo & Title */}
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
              <Palette className="text-white" size={18} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white leading-none">CMS Admin</h1>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Content Manager</p>
            </div>
          </div>
        )}

        {/* Toggle Button - Moved to Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group border border-transparent hover:border-slate-600 ${collapsed ? 'bg-slate-800 border-slate-700' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Tooltip key={item.href} text={item.label} show={collapsed}>
              <Link
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                {/* Active indicator */}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                
                {/* Icon */}
                <Icon 
                  size={20} 
                  className={`shrink-0 transition-transform duration-200 ${
                    hoveredItem === item.href && !isActive ? 'scale-110' : ''
                  }`} 
                />
                
                {/* Label */}
                {!collapsed && (
                  <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                )}

                {/* Hover effect overlay */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300 rounded-lg"></div>
                )}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 shrink-0">
        {!collapsed ? (
          <div className="text-xs text-slate-500 text-center space-y-1">
            <div className="font-semibold text-slate-400">Version 1.0.0</div>
            <div className="text-slate-600">Classic Painters CMS</div>
          </div>
        ) : (
          <div className="flex justify-center">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-700">
                v1.0
             </div>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none"></div>
    </aside>
  );
}
