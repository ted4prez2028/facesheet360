
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ErrorBoundary } from '@/components/security/ErrorBoundary';
import { SessionTimeout } from '@/components/security/SessionTimeout';
import { CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';
import Index from './pages/Index';
import Auth from './pages/Auth';
import LearnMore from './pages/LearnMore';
import ViewPlans from './pages/ViewPlans';
import PostPaymentAuth from './pages/PostPaymentAuth';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import WoundCareDashboard from './pages/WoundCareDashboard';
import AuditLogs from './pages/AuditLogs';
import SecurityCompliance from './pages/SecurityCompliance';
import Subscription from './pages/Subscription';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PatientManagement from './pages/PatientManagement';
import { Toaster } from "@/components/ui/toaster"
import ProfilePage from './pages/ProfilePage';
import { CommunicationProvider } from '@/context/communication/CommunicationContext';
import NotFound from './pages/NotFound';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import WalletDashboard from './pages/WalletDashboard';
import DoctorAccounts from './pages/DoctorAccounts';
import Settings from './pages/Settings';
import EHRImport from './pages/EHRImport';
import { FoodPage } from './pages/Food';
import TaxiPage from './pages/TaxiPage';
import MyChartPage from './pages/MyChart';
import Communication from './pages/Communication';

const queryClient = new QueryClient();

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn('Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to .env');
  }

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
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ''}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="light">
              <AuthProvider>
                <SessionTimeout />
                <UserPreferencesProvider>
                <Routes>
                <Route path="/" element={
                  <RequireAuth>
                    <Navigate to="/dashboard" replace />
                  </RequireAuth>
                } />
                <Route path="/landing" element={<Index />} />
                <Route path="/login" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
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
                          <PatientManagement />
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
                   path="/security"
                   element={
                     <RequireAuth>
                       <CommunicationProvider>
                         <DashboardLayout>
                           <SecurityCompliance />
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
                 <Route
                   path="/communication"
                   element={
                     <RequireAuth>
                       <CommunicationProvider>
                         <DashboardLayout>
                           <Communication />
                         </DashboardLayout>
                       </CommunicationProvider>
                     </RequireAuth>
                   }
                 />
                 <Route
                   path="/audit-logs"
                   element={
                     <RequireAuth>
                       <CommunicationProvider>
                         <DashboardLayout>
                           <AuditLogs />
                         </DashboardLayout>
                       </CommunicationProvider>
                     </RequireAuth>
                   }
                 />
                 <Route
                   path="/ehr-import"
                   element={
                     <RequireAuth>
                       <CommunicationProvider>
                         <DashboardLayout>
                           <EHRImport />
                         </DashboardLayout>
                       </CommunicationProvider>
                     </RequireAuth>
                   }
                 />
                 <Route path="*" element={<NotFound />} />
               </Routes>
              <Toaster />
               </UserPreferencesProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
