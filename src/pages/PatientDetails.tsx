import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PatientHeader } from '@/components/patientview/PatientHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatient } from '@/hooks/usePatient';
import { Spinner } from '@/components/ui/spinner';
import ProfileTab from '@/components/patientview/ProfileTab';
import MedicalDiagnosesTab from '@/components/patientview/MedicalDiagnosesTab';
import AllergiesTab from '@/components/patientview/AllergiesTab';
import WoundCareTab from '@/components/patientview/WoundCareTab';
import MedicationsTab from '@/components/patientview/MedicationsTab';
import ImmunizationsTab from '@/components/patientview/ImmunizationsTab';

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
          <Tabs>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="medical-diagnoses">Medical Diagnoses</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="wound-care">Wound Care</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileTab patient={patient} />
            </TabsContent>
            <TabsContent value="medical-diagnoses">
              <MedicalDiagnosesTab patient={patient} />
            </TabsContent>
            <TabsContent value="allergies">
              <AllergiesTab patient={patient} />
            </TabsContent>
            <TabsContent value="wound-care">
              <WoundCareTab patient={patient} />
            </TabsContent>
            <TabsContent value="medications">
              <MedicationsTab patient={patient} />
            </TabsContent>
            <TabsContent value="immunizations">
              <ImmunizationsTab patient={patient} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientDetails;
