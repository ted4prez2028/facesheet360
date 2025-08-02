import React from 'react';
import { useParams } from 'react-router-dom';
import { PointClickCareEHR } from '@/components/ehr/PointClickCareEHR';

const PatientEHRInterface = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Patient ID not found</div>;
  }

  return (
    <div className="w-full h-screen">
      <PointClickCareEHR patientId={id} />
    </div>
  );
};

export default PatientEHRInterface;