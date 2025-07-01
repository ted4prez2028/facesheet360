
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/types';

interface PatientOverviewProps {
  patient: Patient | undefined;
  patientName: string;
  chartData: any;
}

const PatientOverview: React.FC<PatientOverviewProps> = ({ patient, patientName, chartData }) => {
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{patientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">{patient.date_of_birth}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm text-muted-foreground">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Medical Record Number</p>
              <p className="text-sm text-muted-foreground">{patient.medical_record_number}</p>
            </div>
          </div>
          {patient.allergies && (
            <div>
              <p className="text-sm font-medium">Allergies</p>
              <p className="text-sm text-muted-foreground">{patient.allergies}</p>
            </div>
          )}
          {patient.medical_history && (
            <div>
              <p className="text-sm font-medium">Medical History</p>
              <p className="text-sm text-muted-foreground">{patient.medical_history}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientOverview;
