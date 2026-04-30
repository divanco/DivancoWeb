import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import AdminNavigation from './AdminNavigation';
import LoadingBoundary from '../shared/LoadingBoundary';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <main className="p-6">
        <Suspense fallback={<LoadingBoundary />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;