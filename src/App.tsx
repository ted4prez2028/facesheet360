
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import Subscription from './pages/Subscription';
import PharmacistDashboard from './pages/PharmacistDashboard';
import Charting from './pages/Charting';
import { Toaster } from "@/components/ui/toaster"
import { Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import { CommunicationProvider } from '@/context/communication/CommunicationContext';
import { FloatingCommunicationOrb } from '@/components/communication/FloatingCommunicationOrb';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import WalletDashboard from './pages/WalletDashboard';
import DoctorAccounts from './pages/DoctorAccounts';
import Settings from './pages/Settings';
import { MenuSyncPage } from './pages/MenuSync';

const queryClient = new QueryClient();

function App() {
  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <UserPreferencesProvider>
              <CommunicationProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LandingPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Dashboard />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PatientList />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients/:id"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PatientDetails />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients/:id/wound-care"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <WoundCare />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <ProfilePage />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/subscription"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Subscription />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/pharmacy"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PharmacistDashboard />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Appointments />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Analytics />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/wallet-dashboard"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <WalletDashboard />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/doctor-accounts"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <DoctorAccounts />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/menu-sync"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <MenuSyncPage />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Settings />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/charting"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Charting />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                </Routes>
                <Toaster />
                <FloatingCommunicationOrb />
              </CommunicationProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
