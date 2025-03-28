
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
          patientName={patientData?.name}
          patientId={patientData?.id}
          patientAge={patientData?.age}
        />
      </CardHeader>
      
      <PatientChartTabs 
        patient={patientData} 
        chartData={chartData} 
        patientId={selectedPatient}
        userId={userId}
      />
    </Card>
  );
};

export default PatientChart;
