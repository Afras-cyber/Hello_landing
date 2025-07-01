
import React from 'react';
import AdminSidebar from './AdminSidebar';
import BookingNotifications from './BookingNotifications';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex w-full">
      <AdminSidebar />
      <div className="flex-1 bg-gray-950">
        <main className="p-6">
          {children}
        </main>
        <BookingNotifications />
      </div>
    </div>
  );
};

export default AdminLayout;
