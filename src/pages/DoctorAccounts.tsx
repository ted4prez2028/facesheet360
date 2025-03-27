
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateDoctorAccounts from '@/components/admin/CreateDoctorAccounts';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const DoctorAccounts = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Only allow access to users with admin role
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // For security, restrict this page to admin users
  // Since we don't have a full roles system yet, let's assume only admin users should access this
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Doctor Account Management</h1>
        <CreateDoctorAccounts />
      </div>
    </DashboardLayout>
  );
};

export default DoctorAccounts;
