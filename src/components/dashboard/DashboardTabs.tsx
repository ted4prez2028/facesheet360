
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecentPatients from "./RecentPatients";
import TodayAppointments from "./TodayAppointments";
import PendingTasks from "./PendingTasks";
import EnhancedStatisticsCards from "./EnhancedStatisticsCards";
import DashboardCharts from "./DashboardCharts";
import { RecentPatient, TodayAppointment, PendingTask } from "@/types";
import { useRealAnalytics } from "@/hooks/useRealAnalytics";

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
  const { data: analyticsData } = useRealAnalytics();

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="patients">Patients</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <EnhancedStatisticsCards />

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

      <TabsContent value="analytics" className="space-y-4">
        <DashboardCharts 
          patientStatistics={analyticsData?.patientStatistics || []}
          healthMetrics={analyticsData?.healthMetrics || []}
        />
        {analyticsData?.summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.summary.newPatients} this week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.summary.completedAppointments} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.pendingAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled appointments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.activeMedications}</div>
                <p className="text-xs text-muted-foreground">
                  Currently prescribed
                </p>
              </CardContent>
            </Card>
          </div>
        )}
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
    </Tabs>
  );
};

export default DashboardTabs;
