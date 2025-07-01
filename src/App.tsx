
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

const queryClient = new QueryClient();

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

function App() {
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
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients"
                    element={
                      <RequireAuth>
                        <PatientList />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients/:id"
                    element={
                      <RequireAuth>
                        <PatientDetails />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/patients/:id/wound-care"
                    element={
                      <RequireAuth>
                        <WoundCare />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <ProfilePage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/subscription"
                    element={
                      <RequireAuth>
                        <Subscription />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/pharmacy"
                    element={
                      <RequireAuth>
                        <PharmacistDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/charting"
                    element={
                      <RequireAuth>
                        <Charting />
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
