
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import PatientHeader from '@/components/patientview/PatientHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatient } from '@/hooks/usePatient';
import { Spinner } from '@/components/ui/spinner';
import ProfileTab from '@/components/patientview/ProfileTab';
import MedicalDiagnosesTab from '@/components/patientview/MedicalDiagnosesTab';
import AllergiesTab from '@/components/patientview/AllergiesTab';
import WoundCareTab from '@/components/patientview/WoundCareTab';
import ImmunizationsTab from '@/components/patientview/ImmunizationsTab';
import { PointClickCareEHR } from '@/components/ehr/PointClickCareEHR';
import VitalsTab from '@/components/patientview/VitalsTab';
import { SOAPNoteTab } from '@/components/patientview/SOAPNoteTab';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');
  const { patient, isLoading } = usePatient(id || '');
  const { logEvent } = useAuditLog();

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    // Log patient view access for HIPAA audit
    if (id) {
      logEvent('patient_view', id);
    }
  }, [id, logEvent]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <PatientHeader patient={patient} calculateAge={calculateAge} />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="soap-notes">SOAP Notes</TabsTrigger>
            <TabsTrigger value="medical-diagnoses">Medical Diagnoses</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="wound-care">Wound Care & AI</TabsTrigger>
            <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <PointClickCareEHR patientId={patient.id} />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileTab patientId={patient.id} />
          </TabsContent>
          <TabsContent value="vitals">
            <VitalsTab patientId={patient.id} />
          </TabsContent>

          <TabsContent value="soap-notes">
            <SOAPNoteTab patientId={patient.id} />
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
  );
};

export default PatientDetails;
