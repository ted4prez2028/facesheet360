
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { DailyMenu } from './components/food-order/DailyMenu';
import { MenuSyncPage } from './pages/MenuSync';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/daily-menu" element={<DailyMenu />} />
        <Route path="/menu-sync" element={<MenuSyncPage />} />
      </Routes>
    </Router>
  );
}

export default App;
