'use client';

import { usePathname } from 'next/navigation';
import { LogOut, User, Bell, Search } from 'lucide-react';
import { handleSignOut } from '../../lib/signout';

export default function Header() {
  const pathname = usePathname();
  
  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { href, label };
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-400">/</span>}
              <span className={`transition-colors ${
                index === breadcrumbs.length - 1 
                  ? 'text-slate-900 font-semibold' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
                {crumb.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 group">
            <Search size={18} className="group-hover:scale-110 transition-transform" />
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 text-slate-600 hover:text-slate-900 relative group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200"></div>

          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Admin</span>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => handleSignOut()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium border border-transparent hover:border-red-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
