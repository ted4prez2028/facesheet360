import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ErrorBoundary } from '@/components/security/ErrorBoundary';
import { SessionTimeout } from '@/components/security/SessionTimeout';
import { Toaster } from "@/components/ui/toaster"

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import LearnMore from './pages/LearnMore';
import ViewPlans from './pages/ViewPlans';
import PostPaymentAuth from './pages/PostPaymentAuth';
import PatientMonitoring from './pages/PatientMonitoring';
import SecurityCompliance from './pages/SecurityCompliance';
import Subscription from './pages/Subscription';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import Appointments from './pages/Appointments';
import DoctorAccounts from './pages/DoctorAccounts';
import Settings from './pages/Settings';
import { FoodPage } from './pages/Food';
import CareCoinsHistory from './pages/CareCoinsHistory';
import AdminCashOutRequests from './pages/AdminCashOutRequests';
import CareCoordination from './pages/CareCoordination';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import Telemedicine from './pages/Telemedicine';
import PatientEducation from './pages/PatientEducation';
import InventoryManagement from './pages/InventoryManagement';
import ProductTour from './pages/ProductTour';
import CompareEHR from './pages/CompareEHR';

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
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light">
            <AuthProvider>
              <SessionTimeout />
              <UserPreferencesProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/landing" replace />} />
                  <Route path="/landing" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/learn-more" element={<LearnMore />} />
                  <Route path="/view-plans" element={<ViewPlans />} />
                  <Route path="/product-tour" element={<ProductTour />} />
                  <Route path="/compare-ehr" element={<CompareEHR />} />
                  <Route path="/post-payment-auth" element={<PostPaymentAuth />} />
                  
                  <Route path="/appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
                  <Route path="/patient-monitoring" element={<RequireAuth><PatientMonitoring /></RequireAuth>} />
                  <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
                  <Route path="/doctor-accounts" element={<RequireAuth><DoctorAccounts /></RequireAuth>} />
                  <Route path="/food" element={<RequireAuth><FoodPage /></RequireAuth>} />
                  <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                  <Route path="/security" element={<RequireAuth><SecurityCompliance /></RequireAuth>} />
                  <Route path="/carecoins-history" element={<RequireAuth><CareCoinsHistory /></RequireAuth>} />
                  <Route path="/admin/cashout-requests" element={<RequireAuth><AdminCashOutRequests /></RequireAuth>} />
                  <Route path="/care-coordination" element={<RequireAuth><CareCoordination /></RequireAuth>} />
                  <Route path="/predictive-analytics" element={<RequireAuth><PredictiveAnalytics /></RequireAuth>} />
                  <Route path="/telemedicine" element={<RequireAuth><Telemedicine /></RequireAuth>} />
                  <Route path="/patient-education" element={<RequireAuth><PatientEducation /></RequireAuth>} />
                  <Route path="/inventory-management" element={<RequireAuth><InventoryManagement /></RequireAuth>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </UserPreferencesProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
