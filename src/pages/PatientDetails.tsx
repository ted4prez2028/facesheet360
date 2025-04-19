
import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientHeader from '@/components/patientview/PatientHeader';
import PatientTabs from '@/components/patientview/PatientTabs';
import { Spinner } from '@/components/ui/spinner';

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { patient, isLoading, error } = usePatient(id || '');
  
  useEffect(() => {
    if (id) {
      document.title = `Patient - ${patient?.first_name || ''} ${patient?.last_name || ''}`;
    }
    
    return () => {
      document.title = 'Facesheet360';
    };
  }, [id, patient]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return <Navigate to="/patients" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PatientHeader patient={patient} />
        <PatientTabs patientId={id || ''} />
      </div>
    </DashboardLayout>
  );
};

export default PatientDetails;
