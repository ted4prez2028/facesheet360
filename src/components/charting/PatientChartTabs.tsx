
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Pill, TestTube, Image } from "lucide-react";
import PatientNotes from "./PatientNotes";
import VitalSignsPanel from "@/components/charting/VitalSignsPanel";
import LabResultsPanel from "@/components/charting/LabResultsPanel";
import MedicationsPanel from "@/components/charting/MedicationsPanel";
import ImagingPanel from "@/components/charting/ImagingPanel";

interface PatientChartTabsProps {
  patientId: string;
  userId: string | undefined;
}

const PatientChartTabs = ({ patientId, userId }: PatientChartTabsProps) => {
  return (
    <Tabs defaultValue="notes" className="flex-1 flex flex-col">
      <div className="px-6">
        <TabsList className="my-2">
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Notes</span>
          </TabsTrigger>
          <TabsTrigger value="vitals" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>Vital Signs</span>
          </TabsTrigger>
          <TabsTrigger value="meds" className="flex items-center gap-1">
            <Pill className="h-4 w-4" />
            <span>Medications</span>
          </TabsTrigger>
          <TabsTrigger value="labs" className="flex items-center gap-1">
            <TestTube className="h-4 w-4" />
            <span>Lab Results</span>
          </TabsTrigger>
          <TabsTrigger value="imaging" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <span>Imaging</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="notes" className="flex-1 flex flex-col pt-0 px-0 m-0">
        <PatientNotes patientId={patientId} userId={userId} />
      </TabsContent>
      
      <TabsContent value="vitals" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
        <VitalSignsPanel patientId={patientId} />
      </TabsContent>
      
      <TabsContent value="meds" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
        <MedicationsPanel patientId={patientId} />
      </TabsContent>
      
      <TabsContent value="labs" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
        <LabResultsPanel patientId={patientId} />
      </TabsContent>
      
      <TabsContent value="imaging" className="flex-1 flex flex-col m-0 px-6 py-3 overflow-hidden">
        <ImagingPanel patientId={patientId} />
      </TabsContent>
    </Tabs>
  );
};

export default PatientChartTabs;
