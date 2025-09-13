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
import EmergencyLocationService from '../components/EmergencyLocationService';

export default function Dashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEmergencyLocation, setShowEmergencyLocation] = useState(false);

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
    { id: 'emergency', name: t('emergency') || 'Emergency', icon: '🆘' },
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
        top: '5rem',
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

        {activeTab === 'emergency' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              color: '#1f2937',
              marginBottom: '2rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              🆘 {t('emergencyServices') || 'Emergency Services'}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Find Hospitals */}
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏥</div>
                <h4 style={{
                  color: '#dc2626',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {t('findNearestHospital') || 'Find Nearest Hospital'}
                </h4>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {t('findNearestHospitalDesc') || 'Find the nearest hospitals and emergency services'}
                </p>
                <button
                  onClick={() => setShowEmergencyLocation(true)}
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  🗺️ {t('findNearestHospital') || 'Find Nearest Hospital'}
                </button>
              </div>

              {/* Emergency Contacts */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                border: '2px solid #fed7aa',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
                <h4 style={{
                  color: '#f59e0b',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {t('emergencyContacts') || 'Emergency Contacts'}
                </h4>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {t('quickAccessEmergencyNumbers') || 'Quick access to emergency numbers'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => window.open('tel:911')}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🚨 {t('call911') || 'Call 911'}
                  </button>
                  <button
                    onClick={() => window.open('tel:+1-800-POISON')}
                    style={{
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    ☠️ {t('poisonControl') || 'Poison Control'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Emergency Location Service */}
      <EmergencyLocationService
        isOpen={showEmergencyLocation}
        onClose={() => setShowEmergencyLocation(false)}
      />
    </div>
  );
}
