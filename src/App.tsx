import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import WoundCare from './pages/WoundCare';
import { Toaster } from "@/components/ui/toaster"
import { Navigate } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import { CommunicationProvider } from '@/context/communication/CommunicationContext';
import CommunicationContainer from '@/components/communication/CommunicationContainer';
import ContactsList from '@/components/communication/ContactsList';

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
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
