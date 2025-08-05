import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PatientDetailHeader from "./PatientDetailHeader";
import { PatientChartTabs } from "./PatientChartTabs";
import { PointClickCareEHR } from "@/components/ehr/PointClickCareEHR";
import { 
  useVitalSigns, 
  useLabResults, 
  useMedications, 
  useImagingRecords 
} from "@/hooks/useChartData";
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

interface CombinedPatientViewProps {
  selectedPatient: string | null;
  patientData: LocalPatient | undefined;
  userId: string | undefined;
  onBack: () => void;
}

const CombinedPatientView = ({ 
  selectedPatient, 
  patientData, 
  userId, 
  onBack 
}: CombinedPatientViewProps) => {
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
    notes: [],
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
    return null;
  }

  const displayName = enhancedPatientData 
    ? `${enhancedPatientData.first_name} ${enhancedPatientData.last_name}`.trim()
    : '';

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>

      {/* Combined Patient View */}
      <Card className="shadow-sm flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-0 shrink-0">
          <PatientDetailHeader
            patientName={displayName}
            patientId={enhancedPatientData?.id}
            patientAge={enhancedPatientData?.age}
          />
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
          <Tabs defaultValue="chart" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="chart">Patient Chart</TabsTrigger>
              <TabsTrigger value="ehr">EHR Interface</TabsTrigger>
            </TabsList>

            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="chart" className="h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                <PatientChartTabs 
                  patient={enhancedPatientData} 
                  chartData={chartData} 
                  patientId={selectedPatient}
                  userId={userId}
                />
              </TabsContent>

              <TabsContent value="ehr" className="h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
                <div className="flex-1 overflow-hidden">
                  <PointClickCareEHR patientId={selectedPatient} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CombinedPatientView;