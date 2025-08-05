import React, { useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientOverview from "./PatientOverview";
import VitalSigns from "./VitalSigns";
import MedicationsSection from "./MedicationsSection";
import LabResults from "./LabResults";
import ImagingRecords from "./ImagingRecords";
import NotesSection from "./NotesSection";
import { Patient } from "@/types";

interface PatientChartTabsProps {
  patient: Patient | undefined;
  chartData: any;
  patientId: string | null;
  userId: string | undefined;
}

export const PatientChartTabs = ({ patient, chartData, patientId, userId }: PatientChartTabsProps) => {
  const displayName = patient 
    ? `${patient.first_name} ${patient.last_name}`.trim()
    : 'Unknown Patient';

  return (
    <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4 overflow-hidden">
          <TabsContent value="overview" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <PatientOverview 
              patient={patient}
              patientName={displayName}
              chartData={chartData}
            />
          </TabsContent>

          <TabsContent value="vitals" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <VitalSigns 
              patientId={patientId}
              patientName={displayName}
              vitalSigns={chartData.vitalSigns}
            />
          </TabsContent>

          <TabsContent value="medications" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <MedicationsSection 
              patientId={patientId}
              medications={chartData.medications}
            />
          </TabsContent>

          <TabsContent value="labs" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <LabResults 
              patientId={patientId}
              labResults={chartData.labResults}
            />
          </TabsContent>

          <TabsContent value="imaging" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <ImagingRecords 
              patientId={patientId}
              imagingRecords={chartData.imaging}
            />
          </TabsContent>

          <TabsContent value="notes" className="h-full overflow-y-auto data-[state=active]:flex data-[state=active]:flex-col">
            <NotesSection 
              patientId={patientId}
              providerId={userId}
              notes={chartData.notes}
            />
          </TabsContent>
        </div>
      </Tabs>
    </CardContent>
  );
};
