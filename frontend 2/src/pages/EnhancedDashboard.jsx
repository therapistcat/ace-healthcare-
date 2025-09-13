import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import VitalsTracker from '../components/VitalsTracker';
import MedicationTracker from '../components/MedicationTracker';
import EnhancedFamilyConnections from '../components/EnhancedFamilyConnections';
import HealthCharts from '../components/HealthCharts';
import MedicalBills from '../components/MedicalBills';
import PrescriptionScanner from '../components/PrescriptionScanner';
import GeminiChatbot from '../components/GeminiChatbot';

export default function EnhancedDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Redirect if not authenticated
  if (!token || !user.id) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirects
  if (user) {
    switch (user.role) {
      case 'doctor': 
        return <Navigate to="/dashboard/doctor" replace />;
      case 'family': 
      case 'caregiver': 
        return <Navigate to="/dashboard/family" replace />;
    }
  }

  const tabs = [
    { id: 'overview', name: 'Health Overview', icon: '📊' },
    { id: 'vitals', name: 'Vital Signs', icon: '❤️' },
    { id: 'medications', name: 'Medications', icon: '💊' },
    { id: 'prescriptions', name: 'Prescriptions', icon: '📝' },
    { id: 'bills', name: 'Medical Bills', icon: '🧾' },
    { id: 'family', name: 'Family & Care', icon: '👨‍👩‍👧‍👦' },
    { id: 'reports', name: 'Reports', icon: '📋' }
  ];

  // Check if this is user's first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedDashboard');
    if (hasVisited) {
      setShowWelcome(false);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('hasVisitedDashboard', 'true');
    setShowWelcome(false);
  };

  // Welcome screen for first-time users
  if (showWelcome) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        fontFamily: 'Poppins, system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem',
          maxWidth: '700px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '1.5rem'
          }}>
            🏥
          </div>
          
          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif',
            lineHeight: '1.2'
          }}>
            Welcome to Healthcare+
          </h1>
          
          <p style={{
            fontSize: '1.4rem',
            color: '#6b7280',
            marginBottom: '2.5rem',
            lineHeight: '1.8',
            fontWeight: '400'
          }}>
            Hello <strong>{user?.name || 'there'}</strong>! 👋<br/>
            Your complete digital health companion is ready to help you manage your wellness journey.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: '2rem',
              borderRadius: '20px',
              border: '3px solid #bbf7d0',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '0.8rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Track Your Health
              </h3>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Monitor vitals, medications, and wellness metrics with ease
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '2rem',
              borderRadius: '20px',
              border: '3px solid #fcd34d',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '0.8rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Connect Family
              </h3>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Share health data with loved ones and caregivers safely
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
              padding: '2rem',
              borderRadius: '20px',
              border: '3px solid #81d4fa',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700', 
                color: '#1f2937',
                marginBottom: '0.8rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                AI Assistant
              </h3>
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Get instant health advice and medication reminders
              </p>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '1.2rem 3rem',
              borderRadius: '20px',
              border: 'none',
              fontSize: '1.3rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Poppins, sans-serif'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 20px -3px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            🚀 Get Started
          </button>

          <p style={{
            fontSize: '1rem',
            color: '#9ca3af',
            marginTop: '2rem',
            margin: 0,
            lineHeight: '1.6'
          }}>
            🔒 Your health data is secure and private. We never share your information without your consent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      fontFamily: 'Poppins, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Welcome Header */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 1rem 0',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Welcome back, {user.name}! 👋
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '1.2rem',
            lineHeight: '1.6'
          }}>
            Track your health, manage medications, and stay connected with your care team.
          </p>
        </div>

        {/* Tab Navigation - Enhanced for seniors */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1.2rem 2rem',
                  borderRadius: '18px',
                  border: activeTab === tab.id ? '3px solid #059669' : '2px solid #e5e7eb',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                    : 'white',
                  color: activeTab === tab.id ? 'white' : '#374151',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  minHeight: '70px',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: activeTab === tab.id 
                    ? '0 6px 10px -2px rgba(0, 0, 0, 0.1)' 
                    : '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 10px -2px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          fontSize: '1.1rem',
          lineHeight: '1.8'
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
              borderRadius: '24px',
              padding: '4rem 3rem',
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>📋</div>
              <h2 style={{ 
                color: '#1f2937', 
                marginBottom: '1.5rem',
                fontSize: '2.5rem',
                fontWeight: '800',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Health Reports
              </h2>
              <p style={{ 
                color: '#6b7280',
                fontSize: '1.3rem',
                lineHeight: '1.7'
              }}>
                Comprehensive health reports and analytics coming soon!
              </p>
            </div>
          )}
        </div>
      </div>

      <GeminiChatbot />
    </div>
  );
}
