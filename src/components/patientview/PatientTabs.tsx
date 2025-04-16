import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CensusTab from './CensusTab';
import MedicalDiagnosesTab from './MedicalDiagnosesTab';
import AllergiesTab from './AllergiesTab';
import ImmunizationsTab from './ImmunizationsTab';
import OrdersTab from './OrdersTab';
import VitalsTab from './VitalsTab';
import ResultsTab from './ResultsTab';
import MdsTab from './MdsTab';
import EvaluationsTab from './EvaluationsTab';
import SkinAndWoundTab from './SkinAndWoundTab';
import TherapyTab from './TherapyTab';
import ProgressNoteTab from './ProgressNoteTab';
import CarePlanTab from './CarePlanTab';
import TasksTab from './TasksTab';
import DocumentsTab from './DocumentsTab';
import DashboardTab from './DashboardTab';
import ProfileTab from './ProfileTab';

interface PatientTabsProps {
  patientId: string;
}

const PatientTabs: React.FC<PatientTabsProps> = ({ patientId }) => {
  return (
    <Tabs defaultValue="dash" className="w-full">
      <div className="bg-gray-100 border-b border-gray-300">
        <div className="container overflow-x-auto">
          <TabsList className="bg-transparent h-12 w-auto inline-flex">
            <TabsTrigger className="data-[state=active]:bg-white" value="dash">Dash</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="profile">Profile</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="census">Census</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="med-diag">Med Diag</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="allergy">Allergy</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="immun">Immun</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="orders">Orders</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="vitals">Wks/Vitals</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="results">Results</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="mds">MDS</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="evaluations">Evaluations</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="skin">Skin and Wound</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="therapy">Therapy</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="prog">Prog Note</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="care-plan">Care Plan</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="tasks">Tasks</TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-white" value="documents">Documents</TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <div className="mt-6">
        <TabsContent value="dash">
          <DashboardTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="census">
          <CensusTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="med-diag">
          <MedicalDiagnosesTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="allergy">
          <AllergiesTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="immun">
          <ImmunizationsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="vitals">
          <VitalsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="results">
          <ResultsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="mds">
          <MdsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="evaluations">
          <EvaluationsTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="skin">
          <SkinAndWoundTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="therapy">
          <TherapyTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="prog">
          <ProgressNoteTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="care-plan">
          <CarePlanTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab patientId={patientId} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default PatientTabs;
