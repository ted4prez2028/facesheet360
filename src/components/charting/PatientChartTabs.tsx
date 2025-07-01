
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

// Define a local interface that matches the expected type from GenerateCarePlanButton
interface LocalPatientDataForCarePlan {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  insurance_provider: string; // Made required to match PatientDataForCarePlan
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  notes?: string;
  medical_record_number?: string;
  age?: number;
  name?: string;
  status?: string;
  lastVisit?: string;
  imgUrl?: string;
  created_at?: string;
  provider_id?: string;
  vitalSigns?: any[];
  medicalHistory?: string[];
  condition?: string;
  selectedNotes?: string[];
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
  const preparePatientDataForAI = (): LocalPatientDataForCarePlan | null => {
    if (!patient) return null;
    
    // Handle allergies - ensure it's a string
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
      phone: patient.phone || 'Not provided',
      email: patient.email || 'Not provided',
      address: patient.address || 'Not provided',
      insurance_provider: patient.insurance_provider || 'Not provided', // Ensure this is always a string
      insurance_number: patient.insurance_number,
      emergency_contact_name: patient.emergency_contact_name,
      emergency_contact_phone: patient.emergency_contact_phone,
      emergency_contact_relation: patient.emergency_contact_relation,
      medical_history: patient.medical_history,
      allergies: allergiesString,
      medications: patient.medications,
      notes: patient.notes,
      medical_record_number: patient.medical_record_number,
      age: patient.age,
      name: patient.name,
      status: patient.status,
      lastVisit: patient.lastVisit,
      imgUrl: patient.imgUrl,
      created_at: patient.created_at,
      provider_id: patient.provider_id,
      vitalSigns: chartData?.vitalSigns,
      medicalHistory: chartData?.history || [],
      condition: chartData?.diagnosis
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
