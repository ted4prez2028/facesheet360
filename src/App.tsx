
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { DailyMenu } from './components/food-order/DailyMenu';
import { MenuSyncPage } from './pages/MenuSync';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        {/* Add default route redirecting to daily-menu */}
        <Route path="/" element={<Navigate to="/daily-menu" replace />} />
        <Route path="/daily-menu" element={<DailyMenu />} />
        <Route path="/menu-sync" element={<MenuSyncPage />} />
        {/* Add a catch-all route for 404 errors */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
