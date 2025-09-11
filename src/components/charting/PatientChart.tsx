
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import PatientDetailHeader from "./PatientDetailHeader";
import { PatientChartTabs } from "./PatientChartTabs";
import { 
  useVitalSigns, 
  useLabResults, 
  useMedications, 
  useImagingRecords 
} from "@/hooks/useChartData";
import { useState, useEffect } from "react";
import { Patient } from "@/types";

interface LocalPatient {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: string;
  imgUrl: string | null;
  date_of_birth?: string;
  gender?: string;
  medical_record_number?: string;
}

interface PatientChartProps {
  selectedPatient: string | null;
  patientData: LocalPatient | undefined;
  userId: string | undefined;
}

const PatientChart = ({ selectedPatient, patientData, userId }: PatientChartProps) => {
  // Fetch patient chart data from the database
  const { data: vitalSigns = [] } = useVitalSigns(selectedPatient);
  const { data: labResults = [] } = useLabResults(selectedPatient);
  const { data: medications = [] } = useMedications(selectedPatient);
  const { data: imaging = [] } = useImagingRecords(selectedPatient);

  // Create combined chart data object with proper types
  const chartData = {
    vitalSigns: vitalSigns.map(vs => ({
      ...vs,
      created_at: (vs as any).created_at || new Date().toISOString(),
      updated_at: (vs as any).updated_at || new Date().toISOString()
    })),
    medications: medications,
    labResults: labResults.map(lr => ({
      ...lr,
      result: (lr as any).result || '',
      date_collected: (lr as any).date_collected || (lr as any).created_at || new Date().toISOString()
    })),
    imaging: imaging.map(img => ({
      ...img,
      study_type: (img as any).study_type || '',
      body_part: (img as any).body_part || '',
      study_date: (img as any).study_date || (img as any).created_at || new Date().toISOString()
    })),
    notes: [], // We'll handle notes separately
    history: [],
    diagnosis: "",
    allergies: []
  };

  // Convert local patient data to full Patient type
  const enhancedPatientData: Patient | undefined = patientData ? {
    id: patientData.id,
    first_name: patientData.name?.split(' ')[0] || '',
    last_name: patientData.name?.split(' ').slice(1).join(' ') || '',
    date_of_birth: patientData.date_of_birth || '1990-01-01',
    gender: patientData.gender || 'Not specified',
    phone: '',
    email: '',
    address: '',
    insurance_provider: '',
    insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    medical_history: '',
    allergies: '',
    medications: '',
    notes: '',
    medical_record_number: patientData.medical_record_number || `MR-${patientData.id.slice(0, 8)}`,
    age: patientData.age,
    status: patientData.status,
    lastVisit: patientData.lastVisit,
    imgUrl: patientData.imgUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : undefined;

  if (!selectedPatient) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
          <p className="text-muted-foreground">
            Choose a patient from the list to start charting
          </p>
        </div>
      </div>
    );
  }

  const displayName = enhancedPatientData 
    ? `${enhancedPatientData.first_name} ${enhancedPatientData.last_name}`.trim()
    : '';

  return (
    <Card className="shadow-sm flex-1 flex flex-col">
      <CardHeader className="pb-0">
        <PatientDetailHeader
          patientName={displayName}
          patientId={enhancedPatientData?.id}
          patientAge={enhancedPatientData?.age}
        />
      </CardHeader>
      
      <PatientChartTabs 
        patient={enhancedPatientData} 
        chartData={chartData} 
        patientId={selectedPatient}
        userId={userId}
      />
    </Card>
  );
};

export default PatientChart;
