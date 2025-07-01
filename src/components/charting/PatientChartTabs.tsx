
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
import { Patient } from "@/types";

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

// Simplified patient data interface for care plan generation
interface PatientDataForCarePlan {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  vitalSigns?: any[];
  condition?: string;
  created_at: string;
  updated_at: string;
}

export function PatientChartTabs({ patient, chartData, patientId, userId }: PatientChartTabsProps) {
  const [selectedTab, setSelectedTab] = useState("vitals");
  
  const { generateCarePlan, isGenerating } = useCarePlanGenerator({ 
    patientId: patientId || '' 
  });
  
  const handlePlanGenerated = async (carePlan: string) => {
    // Additional logic if needed
  };
  
  const preparePatientDataForAI = (): PatientDataForCarePlan | null => {
    if (!patient) return null;
    
    let allergiesString = '';
    if (Array.isArray(chartData?.allergies)) {
      allergiesString = chartData.allergies.join(', ');
    } else if (typeof chartData?.allergies === 'string') {
      allergiesString = chartData.allergies;
    } else if (patient.allergies) {
      if (Array.isArray(patient.allergies)) {
        allergiesString = patient.allergies.join(', ');
      } else if (typeof patient.allergies === 'string') {
        allergiesString = patient.allergies;
      }
    }
    
    return {
      id: patient.id,
      first_name: patient.first_name || patient.name?.split(' ')[0] || 'Unknown',
      last_name: patient.last_name || patient.name?.split(' ').slice(1).join(' ') || 'Patient',
      date_of_birth: patient.date_of_birth || '1990-01-01',
      gender: patient.gender || 'Not specified',
      medical_history: patient.medical_history,
      allergies: allergiesString,
      medications: patient.medications,
      vitalSigns: chartData?.vitalSigns,
      condition: chartData?.diagnosis,
      created_at: patient.created_at || new Date().toISOString(),
      updated_at: patient.updated_at || new Date().toISOString()
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
