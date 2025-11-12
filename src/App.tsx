import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ErrorBoundary } from '@/components/security/ErrorBoundary';
import { SessionTimeout } from '@/components/security/SessionTimeout';
import { useCareCoinAutoProcessor } from '@/hooks/useCareCoinAutoProcessor';
import { CareCoinAutoProcessor } from '@/components/CareCoinAutoProcessor';
import FacialRecognitionPreloader from '@/components/facial-recognition/FacialRecognitionPreloader';
import Index from './pages/Index';
import LearnMore from './pages/LearnMore';
import ViewPlans from './pages/ViewPlans';
import PostPaymentAuth from './pages/PostPaymentAuth';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import WoundCareDashboard from './pages/WoundCareDashboard';
import PatientMonitoring from './pages/PatientMonitoring';
import AuditLogs from './pages/AuditLogs';
import SecurityCompliance from './pages/SecurityCompliance';
import Subscription from './pages/Subscription';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PharmacyNotificationPreferences from './pages/PharmacyNotificationPreferences';
import PatientManagement from './pages/PatientManagement';
import { Toaster } from "@/components/ui/toaster"
import ProfilePage from './pages/ProfilePage';
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
import CareCoinsHistory from './pages/CareCoinsHistory';
import CareCoinsAnalytics from './pages/CareCoinsAnalytics';
import AdminCashOutRequests from './pages/AdminCashOutRequests';
import CareCoinsTransactions from './pages/CareCoinsTransactions';
import WalletManagement from './pages/WalletManagement';
import FacialRecognitionGalleryPage from './pages/FacialRecognitionGalleryPage';
import DriverDashboard from './pages/DriverDashboard';
import AdminDriverManagement from './pages/AdminDriverManagement';
import RideHistory from './pages/RideHistory';
import ClinicalDecisionSupport from './pages/ClinicalDecisionSupport';
import CareCoordination from './pages/CareCoordination';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import PatientPortal from './pages/PatientPortal';
import ComplianceCenter from './pages/ComplianceCenter';
import CareCoinEcosystem from './pages/CareCoinEcosystem';
import SecuritySettings from './pages/SecuritySettings';
import Telemedicine from './pages/Telemedicine';
import PatientEducation from './pages/PatientEducation';
import InventoryManagement from './pages/InventoryManagement';
import AdvancedReporting from './pages/AdvancedReporting';
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
              <FacialRecognitionPreloader />
              <CareCoinAutoProcessor />
              <UserPreferencesProvider>
                <Routes>
                <Route path="/" element={
                  <RequireAuth>
                    <Navigate to="/dashboard" replace />
                  </RequireAuth>
                } />
                <Route path="/landing" element={<Index />} />
                <Route path="/login" element={<Index />} />
                <Route path="/learn-more" element={<LearnMore />} />
                <Route path="/view-plans" element={<ViewPlans />} />
                <Route path="/product-tour" element={<ProductTour />} />
                <Route path="/compare-ehr" element={<CompareEHR />} />
                <Route path="/post-payment-auth" element={<PostPaymentAuth />} />
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
                        <PatientManagement />
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
                  path="/facial-recognition-gallery"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <FacialRecognitionGalleryPage />
                      </DashboardLayout>
                    </RequireAuth>
                  }
                />
                <Route
                  path="/wound-care"
                  element={<Navigate to="/patients" replace />}
                />
                <Route
                  path="/patient-monitoring"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <PatientMonitoring />
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
                  path="/pharmacy/notifications"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <PharmacyNotificationPreferences />
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
                  path="/my-chart"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <MyChartPage />
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
                  path="/food"
                  element={
                    <RequireAuth>
                      <DashboardLayout>
                        <FoodPage />
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
                   path="/security"
                   element={
                     <RequireAuth>
                       <DashboardLayout>
                         <SecurityCompliance />
                       </DashboardLayout>
                     </RequireAuth>
                   }
                 />
                  <Route
                    path="/taxi"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <TaxiPage />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/ride-history"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <RideHistory />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/audit-logs"
                   element={
                     <RequireAuth>
                       <DashboardLayout>
                         <AuditLogs />
                       </DashboardLayout>
                     </RequireAuth>
                   }
                 />
                  <Route
                    path="/ehr-import"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <EHRImport />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/carecoins-history"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <CareCoinsHistory />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/carecoins-analytics"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <CareCoinsAnalytics />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/cashout-requests"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <AdminCashOutRequests />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/carecoins-transactions"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <CareCoinsTransactions />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/wallet-management"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <WalletManagement />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/driver"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <DriverDashboard />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/drivers"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <AdminDriverManagement />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/clinical-decision-support"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <ClinicalDecisionSupport />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/care-coordination"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <CareCoordination />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/predictive-analytics"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PredictiveAnalytics />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patient-portal"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PatientPortal />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/compliance-center"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <ComplianceCenter />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/carecoin-ecosystem"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <CareCoinEcosystem />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/security-settings"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <SecuritySettings />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/telemedicine"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <Telemedicine />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patient-education"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <PatientEducation />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <InventoryManagement />
                        </DashboardLayout>
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <RequireAuth>
                        <DashboardLayout>
                          <AdvancedReporting />
                        </DashboardLayout>
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
    </ErrorBoundary>
  );
}

export default App;
