'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from './SidebarContext';

export default function AdminLayoutClient({ children }) {
  const { collapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header />
        <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
