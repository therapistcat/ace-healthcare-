import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './i18n';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import EnhancedDashboard from './pages/EnhancedDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import FamilyDashboard from './pages/FamilyDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import EmergencyVideos from './pages/EmergencyVideos';

function App() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/videos" element={<EmergencyVideos />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['patient', 'family', 'doctor', 'caregiver']}>
              <EnhancedDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute roles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/family"
          element={
            <ProtectedRoute roles={['family', 'caregiver']}>
              <FamilyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/caregiver"
          element={
            <ProtectedRoute roles={['caregiver']}>
              <CaregiverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
