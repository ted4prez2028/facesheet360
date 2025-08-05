import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PointClickCareEHR } from '@/components/ehr/PointClickCareEHR';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { usePatient } from '@/hooks/usePatient';

const PatientEHRInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient } = usePatient(id || '');

  if (!id) {
    return <div>Patient ID not found</div>;
  }

  return (
    <div className="w-full h-full">
      {/* EHR Interface */}
      <PointClickCareEHR patientId={id} />
    </div>
  );
};

export default PatientEHRInterface;