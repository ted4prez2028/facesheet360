
import { AppSidebar } from "./AppSidebar";
import TopNav from "./TopNav";
import { SidebarProvider } from "@/lib/sidebar-provider";
import NotificationSound from "@/components/notifications/NotificationSound";
import MedicationReminders from "@/components/notifications/MedicationReminders";
import CommunicationContainer from "@/components/communication/CommunicationContainer";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
          <TopNav />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
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
