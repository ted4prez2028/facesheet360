
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecentPatients from "./RecentPatients";
import TodayAppointments from "./TodayAppointments";
import PendingTasks from "./PendingTasks";
import AIEvolutionDashboard from "./AIEvolutionDashboard";
import StatisticsCards from "./StatisticsCards";
import { RecentPatient, TodayAppointment, PendingTask } from "@/types";

interface DashboardTabsProps {
  patientStatistics?: any[];
  healthMetrics?: any[];
  recentPatients?: RecentPatient[];
  isRecentPatientsLoading?: boolean;
  todayAppointments?: TodayAppointment[];
  isAppointmentsLoading?: boolean;
  pendingTasks?: PendingTask[];
  isTasksLoading?: boolean;
}

const DashboardTabs = ({ 
  recentPatients = [], 
  todayAppointments = [], 
  pendingTasks = [] 
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="patients">Patients</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="ai-evolution">🤖 AI Evolution</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <StatisticsCards />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RecentPatients patients={recentPatients} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                You have {todayAppointments.length} appointments today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayAppointments appointments={todayAppointments} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="patients" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>
              Patients you've recently worked with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentPatients patients={recentPatients} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appointments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              Your scheduled appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TodayAppointments appointments={todayAppointments} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>
              Tasks that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingTasks tasks={pendingTasks} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai-evolution" className="space-y-4">
        <AIEvolutionDashboard />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
