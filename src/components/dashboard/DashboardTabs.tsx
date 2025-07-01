
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentPatients } from "./RecentPatients";
import { TodayAppointments } from "./TodayAppointments";
import { PendingTasks } from "./PendingTasks";
import { useMockRecentPatients, useMockTodayAppointments, useMockPendingTasks } from "@/hooks/useMockDashboardData";

export const DashboardTabs = () => {
  const { data: recentPatients = [] } = useMockRecentPatients();
  const { data: todayAppointments = [] } = useMockTodayAppointments();
  const { data: pendingTasks = [] } = useMockPendingTasks();

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="patients">Patients</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Appointments Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +5 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                -2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Care Coins Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>
        </div>

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
    </Tabs>
  );
};
