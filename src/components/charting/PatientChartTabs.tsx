
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VitalsTable } from "@/components/charting/VitalsTable";
import { MedicationsTable } from "@/components/charting/MedicationsTable";
import { LabResultsTable } from "@/components/charting/LabResultsTable";
import { ImagingTable } from "@/components/charting/ImagingTable";
import { NotesTable } from "@/components/charting/NotesTable";
import { CarePlanList } from "@/components/charting/CarePlanList";
import { GenerateCarePlanButton } from "@/components/care-plan/GenerateCarePlanButton";
import { useCarePlanGenerator } from "@/hooks/useCarePlanGenerator";
import VitalSignsPanel from "@/components/charting/VitalSignsPanel";
import MedicationsPanel from "@/components/charting/MedicationsPanel";
import LabResultsPanel from "@/components/charting/LabResultsPanel";
import PatientNotes from "@/components/charting/PatientNotes";
import ImagingPanel from "@/components/charting/ImagingPanel";
import { Patient, PatientDataForCarePlan } from "@/types";

interface ChartData {
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  }[];
  medications?: { medication_name: string }[];
  history?: string[];
  diagnosis?: string;
  allergies?: string[];
}

interface PatientChartTabsProps {
  patient: Patient;
  chartData: ChartData;
  patientId: string;
  userId?: string;
}

export function PatientChartTabs({ patient, chartData, patientId, userId }: PatientChartTabsProps) {
  const [selectedTab, setSelectedTab] = useState("vitals");
  
  const { generateCarePlan, isGenerating } = useCarePlanGenerator({ 
    patientId: patientId || '' 
  });
  
  // Handler for when a care plan is generated
  const handlePlanGenerated = async (carePlan: string) => {
    // You can add additional logic here if needed
    // For example, you might want to switch to the care plan tab
  };
  
  // Prepare patient data for AI care plan generation
  const preparePatientDataForAI = (): PatientDataForCarePlan | null => {
    if (!patient) return null;
    
    return {
      ...patient,
      vitalSigns: chartData?.vitalSigns,
      medications: chartData?.medications?.map(med => med.medication_name),
      medicalHistory: chartData?.history || [],
      condition: chartData?.diagnosis,
      allergies: chartData?.allergies?.join(', ') || '', // Convert array to string
    };
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="vitals" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="lab">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vitals">
          <VitalSignsPanel patientId={patientId} />
        </TabsContent>
        
        <TabsContent value="medications">
          <MedicationsPanel patientId={patientId} />
        </TabsContent>
        
        <TabsContent value="lab">
          <LabResultsPanel patientId={patientId} />
        </TabsContent>
        
        <TabsContent value="imaging">
          <ImagingPanel patientId={patientId} />
        </TabsContent>
        
        <TabsContent value="notes">
          {userId && <PatientNotes patientId={patientId} userId={userId} />}
        </TabsContent>
        
        {/* Add the AI Care Plan generator button to the care plans tab */}
        <TabsContent value="care-plans" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Care Plan</CardTitle>
                  <CardDescription>Use AI to create a comprehensive care plan based on patient data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <GenerateCarePlanButton 
                    patientId={patientId || ''}
                    onPlanGenerated={handlePlanGenerated}
                    patientData={preparePatientDataForAI()}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <CarePlanList patientId={patientId || ''} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
