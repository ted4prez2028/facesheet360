
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import TopNav from "./TopNav";
import { SidebarProvider } from "@/lib/sidebar-provider";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import NotificationSound from "@/components/notifications/NotificationSound";
import MedicationReminders from "@/components/notifications/MedicationReminders";
import CommunicationContainer from "@/components/communication/CommunicationContainer";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  console.log('🏠 DashboardLayout check:', { isAuthenticated, authLoading });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🚪 DashboardLayout: Not authenticated, redirecting to login');
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    }
    
    setIsLoading(false);
  }, [isAuthenticated, authLoading, navigate, toast]);

  if (isLoading || authLoading) {
    console.log('⏳ DashboardLayout: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-subtle">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ DashboardLayout: Not authenticated, returning null');
    return null; // Will redirect in useEffect
  }

  console.log('✅ DashboardLayout: Authenticated, rendering layout');

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
          <TopNav />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      {/* These components handle notifications */}
      <NotificationSound />
      <MedicationReminders />
      {/* Communication system */}
      <CommunicationContainer />
    </SidebarProvider>
  );
};

export default DashboardLayout;
