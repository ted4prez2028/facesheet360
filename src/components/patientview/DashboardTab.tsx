
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatientVitals } from '@/hooks/usePatientVitals';
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardTabProps {
  patientId: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ patientId }) => {
  const { data: vitals, isLoading: vitalsLoading } = usePatientVitals(patientId);
  const { data: patient, isLoading: patientLoading } = usePatientProfile(patientId);

  if (vitalsLoading || patientLoading) {
    return <div className="space-y-4"><Skeleton className="h-48" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>Basic patient information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Name</dt>
                <dd>{patient?.first_name} {patient?.last_name}</dd>
              </div>
              <div>
                <dt className="font-medium">MRN</dt>
                <dd>{patient?.medical_record_number}</dd>
              </div>
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd>{new Date(patient?.date_of_birth).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Vitals</CardTitle>
            <CardDescription>Last recorded vital signs</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Blood Pressure</dt>
                <dd>{vitals?.blood_pressure}</dd>
              </div>
              <div>
                <dt className="font-medium">Temperature</dt>
                <dd>{vitals?.temperature}°F</dd>
              </div>
              <div>
                <dt className="font-medium">Heart Rate</dt>
                <dd>{vitals?.heart_rate} bpm</dd>
              </div>
              <div>
                <dt className="font-medium">Weight</dt>
                <dd>{vitals?.weight} lbs</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
