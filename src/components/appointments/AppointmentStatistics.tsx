import { useMemo } from "react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Calendar, Clock, XCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";

const AppointmentStatistics = () => {
  const { data: appointments = [] } = useAppointments();

  const stats = useMemo(() => {
    const now = new Date();
    
    const dailyRange = { start: startOfDay(now), end: endOfDay(now) };
    const weeklyRange = { start: startOfWeek(now), end: endOfWeek(now) };
    const monthlyRange = { start: startOfMonth(now), end: endOfMonth(now) };

    const filterByRange = (range: { start: Date; end: Date }) => {
      return appointments.filter((apt: any) => 
        isWithinInterval(new Date(apt.appointment_date), range)
      );
    };

    const calculateStats = (filteredAppts: any[]) => {
      const total = filteredAppts.length;
      const completed = filteredAppts.filter((a: any) => a.status === 'completed').length;
      const cancelled = filteredAppts.filter((a: any) => a.status === 'cancelled').length;
      const noShow = filteredAppts.filter((a: any) => a.status === 'no-show').length;
      const scheduled = filteredAppts.filter((a: any) => 
        ['scheduled', 'confirmed'].includes(a.status)
      ).length;
      
      return {
        total,
        completed,
        cancelled,
        noShow,
        scheduled,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
        noShowRate: total > 0 ? ((noShow / total) * 100).toFixed(1) : '0',
      };
    };

    return {
      daily: calculateStats(filterByRange(dailyRange)),
      weekly: calculateStats(filterByRange(weeklyRange)),
      monthly: calculateStats(filterByRange(monthlyRange)),
    };
  }, [appointments]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle: string; 
    icon: any; 
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-success">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appointment Statistics</h2>
        <p className="text-muted-foreground">Track your appointment metrics and no-show rates</p>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Today</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Appointments"
              value={stats.daily.total}
              subtitle="Scheduled today"
              icon={Calendar}
            />
            <StatCard
              title="Completed"
              value={stats.daily.completed}
              subtitle={`${stats.daily.completionRate}% completion rate`}
              icon={CheckCircle2}
            />
            <StatCard
              title="No-Shows"
              value={stats.daily.noShow}
              subtitle={`${stats.daily.noShowRate}% no-show rate`}
              icon={XCircle}
            />
            <StatCard
              title="Upcoming"
              value={stats.daily.scheduled}
              subtitle="Awaiting completion"
              icon={Clock}
            />
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Appointments"
              value={stats.weekly.total}
              subtitle="This week"
              icon={Calendar}
            />
            <StatCard
              title="Completed"
              value={stats.weekly.completed}
              subtitle={`${stats.weekly.completionRate}% completion rate`}
              icon={CheckCircle2}
            />
            <StatCard
              title="No-Shows"
              value={stats.weekly.noShow}
              subtitle={`${stats.weekly.noShowRate}% no-show rate`}
              icon={XCircle}
            />
            <StatCard
              title="Upcoming"
              value={stats.weekly.scheduled}
              subtitle="Awaiting completion"
              icon={Clock}
            />
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Appointments"
              value={stats.monthly.total}
              subtitle="This month"
              icon={Calendar}
            />
            <StatCard
              title="Completed"
              value={stats.monthly.completed}
              subtitle={`${stats.monthly.completionRate}% completion rate`}
              icon={CheckCircle2}
            />
            <StatCard
              title="No-Shows"
              value={stats.monthly.noShow}
              subtitle={`${stats.monthly.noShowRate}% no-show rate`}
              icon={XCircle}
            />
            <StatCard
              title="Upcoming"
              value={stats.monthly.scheduled}
              subtitle="Awaiting completion"
              icon={Clock}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Breakdown</CardTitle>
          <CardDescription>Current status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm">Scheduled</span>
              </div>
              <span className="text-sm font-medium">{stats.monthly.scheduled}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm">Completed</span>
              </div>
              <span className="text-sm font-medium">{stats.monthly.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-sm">No-Shows</span>
              </div>
              <span className="text-sm font-medium">{stats.monthly.noShow}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-muted" />
                <span className="text-sm">Cancelled</span>
              </div>
              <span className="text-sm font-medium">{stats.monthly.cancelled}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentStatistics;