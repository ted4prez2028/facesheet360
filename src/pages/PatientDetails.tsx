import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PatientHeader } from '@/components/patientview/PatientHeader';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Patient;
    },
    enabled: !!id
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      {patient && (
        <div className="container mx-auto px-4 py-8">
          <PatientHeader patient={patient} calculateAge={calculateAge} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDetails;
