import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPatientById } from '@/lib/api/patientApi';
import UnifiedPatientInterface from '@/components/charting/UnifiedPatientInterface';
import { useAuth } from '@/context/AuthContext';

export default function PatientDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <p className="text-lg text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const patientData = {
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    age: patient.age || 0,
    status: 'active',
    lastVisit: new Date().toISOString(),
    imgUrl: null,
    date_of_birth: patient.date_of_birth,
    gender: patient.gender,
    medical_record_number: patient.medical_record_number,
    room_number: patient.room_number
  };

  return (
    <div className="h-full p-6">
      <UnifiedPatientInterface
        selectedPatient={id || null}
        patientData={patientData}
        userId={user?.id}
        onBack={() => navigate('/patients')}
      />
    </div>
  );
}
