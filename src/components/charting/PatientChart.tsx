
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

interface Patient {
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
  patientData: Patient | undefined;
  userId: string | undefined;
}

const PatientChart = ({ selectedPatient, patientData, userId }: PatientChartProps) => {
  // Fetch patient chart data from the database
  const { data: vitalSigns = [] } = useVitalSigns(selectedPatient);
  const { data: labResults = [] } = useLabResults(selectedPatient);
  const { data: medications = [] } = useMedications(selectedPatient);
  const { data: imaging = [] } = useImagingRecords(selectedPatient);

  // Create combined chart data object
  const chartData = {
    vitalSigns: vitalSigns,
    medications: medications,
    labResults: labResults,
    imaging: imaging,
    notes: [], // We'll handle notes separately
    history: [],
    diagnosis: "",
    allergies: []
  };

  // Ensure patient data has required properties
  const enhancedPatientData = patientData ? {
    ...patientData,
    date_of_birth: patientData.date_of_birth || '1990-01-01',
    gender: patientData.gender || 'Not specified',
    medical_record_number: patientData.medical_record_number || `MR-${patientData.id.slice(0, 8)}`
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

  return (
    <Card className="shadow-sm flex-1 flex flex-col">
      <CardHeader className="pb-0">
        <PatientDetailHeader
          patientName={enhancedPatientData?.name}
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
