
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateCarePlanButton } from "@/components/care-plan/GenerateCarePlanButton";
import { useCarePlanGenerator } from "@/hooks/useCarePlanGenerator";

interface PatientChartTabsProps {
  patient: any;
  chartData: any;
}

export function PatientChartTabs({ patient, chartData }: PatientChartTabsProps) {
  const [selectedTab, setSelectedTab] = useState("vitals");
  
  const { generateCarePlan, isGenerating } = useCarePlanGenerator({ 
    patientId: patient?.id || '' 
  });
  
  // Handler for when a care plan is generated
  const handlePlanGenerated = async (carePlan: string) => {
    // You can add additional logic here if needed
    // For example, you might want to switch to the care plan tab
  };
  
  // Prepare patient data for AI care plan generation
  const preparePatientDataForAI = () => {
    if (!patient) return null;
    
    return {
      ...patient,
      vitalSigns: chartData?.vitalSigns,
      medications: chartData?.medications?.map(med => med.medication_name),
      medicalHistory: chartData?.history || [],
      condition: chartData?.diagnosis,
      allergies: chartData?.allergies || [],
    };
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="vitals" className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="lab">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vitals">
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">Vital signs data would be displayed here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="medications">
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">Medications data would be displayed here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="lab">
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">Lab results data would be displayed here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="imaging">
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">Imaging data would be displayed here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="p-4 border rounded-md">
            <p className="text-muted-foreground">Patient notes would be displayed here.</p>
          </div>
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
                    patientId={patient?.id || ''}
                    onPlanGenerated={handlePlanGenerated}
                    patientData={preparePatientDataForAI()}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Care Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {patient?.id 
                      ? "Patient care plans would be displayed here." 
                      : "Select a patient to view care plans."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
