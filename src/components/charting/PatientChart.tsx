
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import PatientDetailHeader from "./PatientDetailHeader";
import { PatientChartTabs } from "./PatientChartTabs";

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

  // Create a sample chart data object with the structure expected by PatientChartTabs
  const chartData = {
    vitalSigns: [],
    medications: [],
    labResults: [],
    imaging: [],
    notes: [],
    history: [],
    diagnosis: "",
    allergies: []
  };

  return (
    <Card className="shadow-sm flex-1 flex flex-col">
      <CardHeader className="pb-0">
        <PatientDetailHeader
          patientName={patientData?.name}
          patientId={patientData?.id}
          patientAge={patientData?.age}
        />
      </CardHeader>
      
      <PatientChartTabs patient={patientData} chartData={chartData} />
    </Card>
  );
};

export default PatientChart;
