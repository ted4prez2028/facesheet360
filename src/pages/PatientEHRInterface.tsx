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
    <div className="w-full h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/patients/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patient
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">
              {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/patients')}
          >
            All Patients
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>
      
      {/* EHR Interface */}
      <div className="h-[calc(100vh-73px)]">
        <PointClickCareEHR patientId={id} />
      </div>
    </div>
  );
};

export default PatientEHRInterface;