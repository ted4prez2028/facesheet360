
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import { CommunicationProvider } from '@/context/communication/CommunicationContext';
import CommunicationContainer from '@/components/communication/CommunicationContainer';
import ContactsList from '@/components/communication/ContactsList';
import WalletDashboard from './pages/WalletDashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Appointments from './pages/Appointments';
import Charting from './pages/Charting';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  const queryClient = new QueryClient();

  const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
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
                  <Route path="/login" element={<Login />} />
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
                    path="/appointments"
                    element={
                      <RequireAuth>
                        <Appointments />
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
                  <Route
                    path="/analytics"
                    element={
                      <RequireAuth>
                        <Analytics />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RequireAuth>
                        <Settings />
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
                    path="/wallet"
                    element={
                      <RequireAuth>
                        <WalletDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <CommunicationContainer />
                <ContactsList />
              </CommunicationProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
