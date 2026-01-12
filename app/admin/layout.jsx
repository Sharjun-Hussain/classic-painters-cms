import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 transition-all duration-300">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
