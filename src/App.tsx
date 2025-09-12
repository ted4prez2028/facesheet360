import React from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from '@/hooks/useAuth';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import LearnMore from './pages/LearnMore';
import ViewPlans from './pages/ViewPlans';
import PostPaymentAuth from './pages/PostPaymentAuth';
import Dashboard from './pages/Dashboard';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import WoundCareDashboard from './pages/WoundCareDashboard';
import Subscription from './pages/Subscription';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PatientManagement from './pages/PatientManagement';
import { Toaster } from "@/components/ui/toaster";
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

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  const ProtectedRoutes = () => (
    <RequireAuth>
      <CommunicationProvider>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </CommunicationProvider>
    </RequireAuth>
  );

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

              <Route element={<ProtectedRoutes />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<PatientManagement />} />
                <Route path="/patients/:id" element={<PatientDetails />} />
                <Route path="/patients/:id/detail" element={<PatientEHRInterface />} />
                <Route path="/patients/:id/wound-care" element={<WoundCare />} />
                <Route path="/wound-care" element={<WoundCareDashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/pharmacy" element={<PharmacistDashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/wallet-dashboard" element={<WalletDashboard />} />
                <Route path="/my-chart" element={<MyChartPage />} />
                <Route path="/doctor-accounts" element={<DoctorAccounts />} />
                <Route path="/food" element={<FoodPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/taxi" element={<TaxiPage />} />
              </Route>
            </Routes>
            <Toaster />
          </UserPreferencesProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

