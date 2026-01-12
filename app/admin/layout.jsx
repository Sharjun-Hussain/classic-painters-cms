import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { SidebarProvider } from './components/SidebarContext';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './components/AdminLayoutClient';

export default async function AdminLayout({ children }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </div>
    </SidebarProvider>
  );
}
