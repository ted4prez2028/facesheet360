
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
                <dd>{patient?.first_name} {patient?.last_name}</dd>
              </div>
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd>{new Date(patient?.date_of_birth).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="font-medium">Gender</dt>
                <dd>{patient?.gender}</dd>
              </div>
            </dl>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Email</dt>
                <dd>{patient?.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone</dt>
                <dd>{patient?.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-medium">Address</dt>
                <dd>{patient?.address || 'Not provided'}</dd>
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
              <dd>{patient?.insurance_provider || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium">Policy Number</dt>
              <dd>{patient?.policy_number || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="font-medium">Medical Record Number</dt>
              <dd>{patient?.medical_record_number || 'Not provided'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
