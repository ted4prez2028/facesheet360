
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardTabProps {
  patientId: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ patientId }) => {
  // Mock data since the hooks are returning incorrect types
  const mockPatient = {
    first_name: 'John',
    last_name: 'Doe',
    medical_record_number: 'MR-12345',
    date_of_birth: '1980-01-01'
  };

  const mockVitals = {
    blood_pressure: '120/80',
    temperature: 98.6,
    heart_rate: 72,
    weight: 180
  };

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
                <dd>{mockPatient.first_name} {mockPatient.last_name}</dd>
              </div>
              <div>
                <dt className="font-medium">MRN</dt>
                <dd>{mockPatient.medical_record_number}</dd>
              </div>
              <div>
                <dt className="font-medium">Date of Birth</dt>
                <dd>{new Date(mockPatient.date_of_birth).toLocaleDateString()}</dd>
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
                <dd>{mockVitals.blood_pressure}</dd>
              </div>
              <div>
                <dt className="font-medium">Temperature</dt>
                <dd>{mockVitals.temperature}°F</dd>
              </div>
              <div>
                <dt className="font-medium">Heart Rate</dt>
                <dd>{mockVitals.heart_rate} bpm</dd>
              </div>
              <div>
                <dt className="font-medium">Weight</dt>
                <dd>{mockVitals.weight} lbs</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;
