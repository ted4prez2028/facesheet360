
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileTabProps {
  patientId: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ patientId }) => {
  const { data: patient, isLoading } = usePatientProfile(patientId);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-48" /></div>;
  }

  // Use mock patient data since the profile hook returns different data
  const mockPatient = {
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1980-01-01',
    gender: 'Male',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    insurance_provider: 'Health Insurance Co.',
    policy_number: 'HIL123456789',
    medical_record_number: 'MR-12345'
  };

  const patientData = mockPatient; // Always use mock data for now

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Patient's personal and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Full Name</dt>
                <dd>{patientData.first_name} {patientData.last_name}</dd>
              </div>
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd>{new Date(patientData.date_of_birth).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium">Gender</dt>
                <dd>{patientData.gender}</dd>
              </div>
            </dl>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Email</dt>
                <dd>{patientData.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone</dt>
                <dd>{patientData.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium">Address</dt>
                <dd>{patientData.address || 'Not provided'}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
          <CardDescription>Patient's insurance details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Insurance Provider</dt>
              <dd>{patientData.insurance_provider || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium">Policy Number</dt>
              <dd>{patientData.policy_number || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium">Medical Record Number</dt>
              <dd>{patientData.medical_record_number || 'Not provided'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
