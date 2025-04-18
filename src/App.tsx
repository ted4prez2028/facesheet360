import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Patients } from './pages/Patients';
import { PatientView } from './pages/PatientView';
import { Appointments } from './pages/Appointments';
import { MedicationReminders } from './pages/MedicationReminders';
import { Wallet } from './pages/Wallet';
import { Messaging } from './pages/Messaging';
import { VideoCall } from './pages/VideoCall';
import { FoodOrderPage } from './pages/FoodOrderPage';
import { CallLightRequestsPage } from './pages/CallLightRequestsPage';
import { DailyMenu } from './components/food-order/DailyMenu';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patient/:id" element={<PatientView />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/medication-reminders" element={<MedicationReminders />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/food-order" element={<FoodOrderPage />} />
        <Route path="/call-light-requests" element={<CallLightRequestsPage />} />
        <Route path="/daily-menu" element={<DailyMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
