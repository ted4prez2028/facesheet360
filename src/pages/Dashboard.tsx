
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import CareCoinsActivity from "@/components/wallet/CareCoinsActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { usePatientStatistics, usePatientHealthMetrics } from "@/hooks/usePatientStatistics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useRecentPatients } from "@/hooks/useRecentPatients";
import { useAppointmentsToday } from "@/hooks/useAppointmentsToday";
import { usePendingTasks } from "@/hooks/usePendingTasks";

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState("year");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  
  const { data: patientsList } = usePatients();
  const { data: patientStatistics = [], isLoading: isStatsLoading } = usePatientStatistics(timeframe);
  const { data: healthMetrics = [], isLoading: isMetricsLoading } = usePatientHealthMetrics(selectedPatientId);
  
  // Fetch dynamic data
  const { data: recentPatients, isLoading: isRecentPatientsLoading } = useRecentPatients();
  const { data: todayAppointments, isLoading: isAppointmentsLoading } = useAppointmentsToday();
  const { data: pendingTasks, isLoading: isTasksLoading } = usePendingTasks();
  
  const firstName = user?.name ? user.name.split(' ')[0] : "Doctor";

  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "Dashboard updated",
        description: "All patient data is now up to date",
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {firstName}. Here's what's happening today.
          </p>
        </div>
        
        <StatisticsCards />
        
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold">Patient Analytics</h2>
            <div className="flex gap-4 items-center">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={selectedPatientId} 
                onValueChange={setSelectedPatientId}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select patient for metrics" />
                </SelectTrigger>
                <SelectContent>
                  {patientsList?.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DashboardTabs 
            patientStatistics={patientStatistics}
            healthMetrics={healthMetrics}
            recentPatients={recentPatients}
            isRecentPatientsLoading={isRecentPatientsLoading}
            todayAppointments={todayAppointments}
            isAppointmentsLoading={isAppointmentsLoading}
            pendingTasks={pendingTasks}
            isTasksLoading={isTasksLoading}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <CareCoinsActivity onViewAll={() => navigate("/settings?tab=wallet")} />
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
