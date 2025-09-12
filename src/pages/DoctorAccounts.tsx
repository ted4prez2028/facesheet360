
import React from 'react';
import CreateDoctorAccounts from '@/components/admin/CreateDoctorAccounts';
import { Navigate } from 'react-router-dom';
import { useAdminStatus } from '@/hooks/useAdminStatus';

const DoctorAccounts = () => {
  const { isAdmin, isLoading } = useAdminStatus();

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Doctor Account Management</h1>
        <CreateDoctorAccounts />
    </div>
  );
};

export default DoctorAccounts;
