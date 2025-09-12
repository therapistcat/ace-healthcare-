import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from './components/ui/sonner';
import healthcareService from './services/healthcareService';

// Pages
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import PatientDashboard from './pages/PatientDashboard';
import MedicationManagement from './pages/MedicationManagement';
import FamilyDashboard from './pages/FamilyDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import FinanceAndSchemes from './pages/FinanceAndSchemes';
import ReportsAndBills from './pages/ReportsAndBills';
import SettingsPage from './pages/SettingsPage';

// Components
import MobileNavigation from './components/MobileNavigation';
import ChatbotWidget from './components/ChatbotWidget';
import ReminderModal from './components/ReminderModal';
import DemoModeIndicator from './components/DemoModeIndicator';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'family' | 'doctor'>('patient');
  const [showReminder, setShowReminder] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('App component rendering...', { isInitializing, isAuthenticated, error });

  // Check for existing session on app start
  useEffect(() => {
    console.log('App initializing...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const session = await healthcareService.getSession();
      console.log('Session response:', session);
      if (session?.user) {
        setIsAuthenticated(true);
        setUserRole(session.user.role || session.user.user_metadata?.role || 'patient');
      }
    } catch (error) {
      console.warn('Failed to check auth status:', error);
      // Don't set error for auth failures, just proceed as unauthenticated
    } finally {
      setIsInitializing(false);
      console.log('App initialization complete');
    }
  };

  // Simulate periodic medication reminders
  useEffect(() => {
    if (isAuthenticated && userRole === 'patient') {
      const interval = setInterval(() => {
        // Random chance of showing reminder for demo purposes
        if (Math.random() < 0.1) { // 10% chance every interval
          setShowReminder(true);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userRole]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center animate-pulse mx-auto">
            <span className="text-2xl">🏥</span>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">HealthCare+</p>
            <p className="text-muted-foreground">Preparing your health platform...</p>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <AppProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/onboarding" 
                element={
                  <OnboardingPage 
                    onComplete={(role) => {
                      setUserRole(role);
                      setIsAuthenticated(true);
                    }} 
                  />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </AppProvider>
      </Router>
    );
  }

  return (
    <Router>
      <AppProvider>
        <div className="min-h-screen bg-background pb-20 md:pb-0">
          <Routes>
            {userRole === 'patient' && (
              <>
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/medications" element={<MedicationManagement />} />
                <Route path="/finance" element={<FinanceAndSchemes />} />
                <Route path="/reports" element={<ReportsAndBills />} />
              </>
            )}
            {userRole === 'family' && (
              <Route path="/dashboard" element={<FamilyDashboard />} />
            )}
            {userRole === 'doctor' && (
              <Route path="/dashboard" element={<DoctorDashboard />} />
            )}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <MobileNavigation userRole={userRole} />
          <ChatbotWidget />
          <DemoModeIndicator />
          
          {showReminder && (
            <ReminderModal 
              onClose={() => setShowReminder(false)}
              onComplete={() => setShowReminder(false)}
            />
          )}
        </div>
        <Toaster position="top-right" />
      </AppProvider>
    </Router>
  );
}