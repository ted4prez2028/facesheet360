
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import CareCoinsActivity from "@/components/wallet/CareCoinsActivity";
import QuickActions from "@/components/dashboard/QuickActions";

const patientStatistics = [
  { name: "Mon", newPatients: 4, activePatients: 22, avg: 18 },
  { name: "Tue", newPatients: 3, activePatients: 25, avg: 19 },
  { name: "Wed", newPatients: 5, activePatients: 28, avg: 22 },
  { name: "Thu", newPatients: 2, activePatients: 27, avg: 20 },
  { name: "Fri", newPatients: 6, activePatients: 30, avg: 24 },
  { name: "Sat", newPatients: 3, activePatients: 14, avg: 12 },
  { name: "Sun", newPatients: 1, activePatients: 8, avg: 6 },
];

const healthMetrics = [
  { name: "Jan", heartRate: 75, bloodPressure: 120, o2Saturation: 98 },
  { name: "Feb", heartRate: 72, bloodPressure: 118, o2Saturation: 97 },
  { name: "Mar", heartRate: 78, bloodPressure: 125, o2Saturation: 99 },
  { name: "Apr", heartRate: 74, bloodPressure: 115, o2Saturation: 98 },
  { name: "May", heartRate: 76, bloodPressure: 122, o2Saturation: 97 },
  { name: "Jun", heartRate: 73, bloodPressure: 119, o2Saturation: 98 }
];

const recentPatients = [
  { id: 1, name: "John Smith", age: 45, condition: "Hypertension", lastVisit: "2 days ago", status: "Stable" },
  { id: 2, name: "Maria Rodriguez", age: 32, condition: "Pregnancy", lastVisit: "1 day ago", status: "Follow-up" },
  { id: 3, name: "Robert Johnson", age: 67, condition: "Diabetes Type 2", lastVisit: "Today", status: "Critical" },
  { id: 4, name: "Emily Davis", age: 28, condition: "Migraine", lastVisit: "3 days ago", status: "Stable" }
];

const upcomingAppointments = [
  { id: 1, patient: "James Wilson", time: "9:00 AM", type: "Check-up", duration: "30 min" },
  { id: 2, patient: "Sarah Thompson", time: "10:30 AM", type: "Follow-up", duration: "45 min" },
  { id: 3, patient: "Michael Brown", time: "1:15 PM", type: "Consultation", duration: "60 min" },
  { id: 4, patient: "Lisa Anderson", time: "3:00 PM", type: "Procedure", duration: "45 min" }
];

const pendingTasks = [
  { id: 1, task: "Review lab results for Robert Johnson", priority: "High", due: "Today" },
  { id: 2, task: "Update treatment plan for Maria Rodriguez", priority: "Medium", due: "Tomorrow" },
  { id: 3, task: "Sign off on discharge papers for Emily Davis", priority: "High", due: "Today" },
  { id: 4, task: "Follow up on referral for John Smith", priority: "Low", due: "Next Week" }
];

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
        
        <DashboardTabs 
          patientStatistics={patientStatistics}
          healthMetrics={healthMetrics}
          recentPatients={recentPatients}
          upcomingAppointments={upcomingAppointments}
          pendingTasks={pendingTasks}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <CareCoinsActivity onViewAll={() => navigate("/settings?tab=wallet")} />
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
