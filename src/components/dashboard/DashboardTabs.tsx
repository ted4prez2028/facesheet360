
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RecentPatients from "./RecentPatients";
import TodayAppointments from "./TodayAppointments";
import PendingTasks from "./PendingTasks";
import DashboardCharts from "./DashboardCharts";

interface DashboardTabsProps {
  patientStatistics: any[];
  healthMetrics: any[];
  recentPatients?: any[];
  isRecentPatientsLoading?: boolean;
  todayAppointments?: any[];
  isAppointmentsLoading?: boolean;
  pendingTasks?: any[];
  isTasksLoading?: boolean;
}

const DashboardTabs = ({
  patientStatistics,
  healthMetrics,
  recentPatients,
  isRecentPatientsLoading,
  todayAppointments,
  isAppointmentsLoading,
  pendingTasks,
  isTasksLoading
}: DashboardTabsProps) => {
  const [timeframe, setTimeframe] = useState("week");

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTimeframe("week")}>
            Week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeframe("month")}>
            Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTimeframe("year")}>
            Year
          </Button>
        </div>
      </div>
      
      <TabsContent value="overview" className="mt-6">
        <DashboardCharts 
          patientStatistics={patientStatistics} 
          healthMetrics={healthMetrics} 
        />
      </TabsContent>
      
      <TabsContent value="patients" className="mt-6">
        <RecentPatients 
          patients={recentPatients} 
          isLoading={isRecentPatientsLoading} 
        />
      </TabsContent>
      
      <TabsContent value="appointments" className="mt-6">
        <TodayAppointments 
          appointments={todayAppointments} 
          isLoading={isAppointmentsLoading} 
        />
      </TabsContent>
      
      <TabsContent value="tasks" className="mt-6">
        <PendingTasks 
          tasks={pendingTasks} 
          isLoading={isTasksLoading} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
