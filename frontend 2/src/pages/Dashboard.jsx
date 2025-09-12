import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import VitalsTracker from '../components/VitalsTracker';
import MedicationTracker from '../components/MedicationTracker';
import EnhancedFamilyConnections from '../components/EnhancedFamilyConnections';
import HealthCharts from '../components/HealthCharts';
import MedicalBills from '../components/MedicalBills';
import PrescriptionScanner from '../components/PrescriptionScanner';
import GeminiChatbot from '../components/GeminiChatbot';

export default function Dashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
  }, []);

  // Redirect to role-specific dashboard
  if (user) {
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/dashboard/doctor" replace />;
      case 'family':
      case 'caregiver':
        return <Navigate to="/dashboard/family" replace />;
      case 'patient':
      default:
        // Continue to patient dashboard below
        break;
    }
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
      }}>
        <div style={{color: '#6b7280'}}>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'vitals', name: 'Vital Signs', icon: '❤️' },
    { id: 'medications', name: 'Medications', icon: '💊' },
    { id: 'prescriptions', name: 'Prescriptions', icon: '📝' },
    { id: 'bills', name: 'Medical Bills', icon: '🧾' },
    { id: 'family', name: 'Family & Care', icon: '👨‍👩‍👧‍👦' },
    { id: 'reports', name: 'Reports', icon: '📋' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      paddingBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '2rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome back, {user.name}! 👋
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            Track your health, manage medications, and stay connected with your care team.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: '4rem',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            padding: '1rem 0'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.id ? '#059669' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.color = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <span style={{fontSize: '1.25rem'}}>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {activeTab === 'overview' && <HealthCharts />}
        {activeTab === 'vitals' && <VitalsTracker />}
        {activeTab === 'medications' && <MedicationTracker />}
        {activeTab === 'prescriptions' && <PrescriptionScanner />}
        {activeTab === 'bills' && <MedicalBills />}
        {activeTab === 'family' && <EnhancedFamilyConnections />}
        {activeTab === 'reports' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{color: '#1f2937', marginBottom: '1rem'}}>📋 Health Reports</h3>
            <p style={{color: '#6b7280'}}>Coming soon - Comprehensive health analytics and reports</p>
          </div>
        )}
      </div>

      {/* Gemini Chatbot */}
      <GeminiChatbot />
    </div>
  );
}
