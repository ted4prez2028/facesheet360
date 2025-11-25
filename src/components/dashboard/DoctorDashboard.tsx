import { useAuth } from "@/hooks/useAuth";
import QuickActions from "./QuickActions";
import TodayAppointments from "./TodayAppointments";
import RecentPatients from "./RecentPatients";
import StatisticsCards from "./StatisticsCards";

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Dr. {user?.name}</p>
        </div>
      </div>

      <StatisticsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayAppointments />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <RecentPatients />
    </div>
  );
};

export default DoctorDashboard;
