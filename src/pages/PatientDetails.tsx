
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientHeader from '@/components/patientview/PatientHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatient } from '@/hooks/usePatient';
import { Spinner } from '@/components/ui/spinner';
import ProfileTab from '@/components/patientview/ProfileTab';
import MedicalDiagnosesTab from '@/components/patientview/MedicalDiagnosesTab';
import AllergiesTab from '@/components/patientview/AllergiesTab';
import WoundCareTab from '@/components/patientview/WoundCareTab';
import ImmunizationsTab from '@/components/patientview/ImmunizationsTab';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, isLoading } = usePatient(id || '');

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <PatientHeader patient={patient} />
        <Tabs>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="medical-diagnoses">Medical Diagnoses</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="wound-care">Wound Care</TabsTrigger>
            <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTab patientId={patient.id} />
          </TabsContent>
          <TabsContent value="medical-diagnoses">
            <MedicalDiagnosesTab patientId={patient.id} />
          </TabsContent>
          <TabsContent value="allergies">
            <AllergiesTab patientId={patient.id} />
          </TabsContent>
          <TabsContent value="wound-care">
            <WoundCareTab patientId={patient.id} />
          </TabsContent>
          <TabsContent value="immunizations">
            <ImmunizationsTab patientId={patient.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetails;
