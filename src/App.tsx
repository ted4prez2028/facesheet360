
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CommunicationProvider } from "./context/CommunicationContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Charting from "./pages/Charting";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import EnvExample from "./components/EnvExample";
import PatientProfile from "./pages/PatientProfile";
import ContactsList from "./components/communication/ContactsList";
import ChatWindows from "./components/communication/ChatWindows";
import CallDialog from "./components/communication/CallDialog";
import NotificationSound from "./components/notifications/NotificationSound";

// Configure React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CommunicationProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/charting" element={<Charting />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/settings/configuration" element={<EnvExample />} />
                <Route path="/patients/:patientId" element={<PatientProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Communication components */}
              <ContactsList />
              <ChatWindows />
              <CallDialog />
              <NotificationSound />
            </CommunicationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
