import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import NurseDashboard from "@/components/dashboard/NurseDashboard";
import CNADashboard from "@/components/dashboard/CNADashboard";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import SocialWorkerDashboard from "@/components/dashboard/SocialWorkerDashboard";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render dashboard based on user role
  const roleMap: Record<string, React.ReactElement> = {
    admin: <AdminDashboard />,
    doctor: <DoctorDashboard />,
    nurse: <NurseDashboard />,
    cna: <CNADashboard />,
    patient: <PatientDashboard />,
    therapist: <SocialWorkerDashboard />,
  };

  return roleMap[user.role as string] || <DoctorDashboard />;
};

export default Dashboard;
