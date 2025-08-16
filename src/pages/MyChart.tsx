import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PointClickCareEHR } from '@/components/ehr/PointClickCareEHR';

const MyChartPage = () => {
  const { user } = useAuth();
  if (!user) return <div>Loading...</div>;
  return (
    <div className="w-full h-full">
      <PointClickCareEHR patientId={user.id} />
    </div>
  );
};

export default MyChartPage;
