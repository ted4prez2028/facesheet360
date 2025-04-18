
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { DailyMenu } from './components/food-order/DailyMenu';
import { MenuSyncPage } from './pages/MenuSync';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Add default route redirecting to dashboard if authenticated, otherwise to login */}
        <Route path="/" element={
          isLoading ? (
            <div className="flex items-center justify-center h-screen">Loading...</div>
          ) : (
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          )
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-menu" element={<DailyMenu />} />
        <Route path="/menu-sync" element={<MenuSyncPage />} />
        {/* Add a catch-all route for 404 errors */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
