
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { useAuth } from '@/hooks/useAuth';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { supabase } from '@/integrations/supabase/client';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import LearnMore from './pages/LearnMore';
import ViewPlans from './pages/ViewPlans';
import PostPaymentAuth from './pages/PostPaymentAuth';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import WoundCareDashboard from './pages/WoundCareDashboard';
import Subscription from './pages/Subscription';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PatientManagement from './pages/PatientManagement';
import { Toaster } from "@/components/ui/toaster"
import ProfilePage from './pages/ProfilePage';
import PatientEHRInterface from './pages/PatientEHRInterface';
import { CommunicationProvider } from '@/context/communication/CommunicationContext';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import WalletDashboard from './pages/WalletDashboard';
import DoctorAccounts from './pages/DoctorAccounts';
import Settings from './pages/Settings';
import { FoodPage } from './pages/Food';
import TaxiPage from './pages/TaxiPage';
import MyChartPage from './pages/MyChart';

const queryClient = new QueryClient();

function App() {
  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [checkingSession, setCheckingSession] = React.useState(true);
    const [sessionExists, setSessionExists] = React.useState(false);

    React.useEffect(() => {
      let active = true;
      const verify = async () => {
        const { data } = await supabase.auth.getSession();
        if (active) {
          setSessionExists(!!data.session);
          setCheckingSession(false);
        }
      };
      verify();
      return () => {
        active = false;
      };
    }, []);

    if (isLoading || checkingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated && !sessionExists) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <UserPreferencesProvider>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LandingPage />} />
                <Route path="/learn-more" element={<LearnMore />} />
                <Route path="/view-plans" element={<ViewPlans />} />
                <Route path="/post-payment-auth" element={<PostPaymentAuth />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <PatientManagement />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/patients/:id"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <PatientDetails />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/patients/:id/detail"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <PatientEHRInterface />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/patients/:id/wound-care"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <WoundCare />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/wound-care"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <WoundCareDashboard />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <ProfilePage />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Subscription />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/pharmacy"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <PharmacistDashboard />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Appointments />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Analytics />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/wallet-dashboard"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <WalletDashboard />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/my-chart"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <MyChartPage />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/doctor-accounts"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <DoctorAccounts />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/food"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <FoodPage />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                 />
                 <Route
                   path="/taxi"
                   element={
                     <RequireAuth>
                       <CommunicationProvider>
                         <DashboardLayout>
                           <TaxiPage />
                         </DashboardLayout>
                       </CommunicationProvider>
                     </RequireAuth>
                   }
                 />
               </Routes>
              <Toaster />
            </UserPreferencesProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
