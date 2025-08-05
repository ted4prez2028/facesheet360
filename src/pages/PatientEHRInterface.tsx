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
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900 text-lg">
              {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading...'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/patients')}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            All Patients
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            Dashboard
          </Button>
        </div>
      </div>

      {/* Patient Chart Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Patient Chart</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>Room: 101A</span>
                  <span>•</span>
                  <span>DOB: {patient ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                  <span>•</span>
                  <span>MRN: {patient?.medical_record_number || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              AI Care Plan
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Wound Assessment
            </Button>
          </div>
        </div>
      </div>
      
      {/* EHR Interface */}
      <div className="h-[calc(100vh-145px)]">
        <PointClickCareEHR patientId={id} />
      </div>
    </div>
  );
};

export default PatientEHRInterface;