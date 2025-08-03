
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
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
import Charting from './pages/Charting';
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
                          <PatientList />
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
                      <PatientEHRInterface />
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
                  path="/menu-sync"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <MenuSyncPage />
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
                  path="/charting"
                  element={
                    <RequireAuth>
                      <CommunicationProvider>
                        <DashboardLayout>
                          <Charting />
                        </DashboardLayout>
                        
                      </CommunicationProvider>
                    </RequireAuth>
                  }
                />
              </Routes>
              <Toaster />
            </UserPreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
