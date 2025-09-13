import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import gsap from 'gsap';
import api from '../api/client';
import EmergencyLocationService from '../components/EmergencyLocationService';
import AppointmentScheduler from '../components/AppointmentScheduler';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [showEmergencyLocation, setShowEmergencyLocation] = useState(false);
  const boxRef = useRef();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
    if (boxRef.current) {
      gsap.from(boxRef.current, { y: 20, opacity: 0, duration: 0.6 });
    }
  }, []);

  // Redirect to enhanced dashboard for patients
  if (user && user.role === 'patient') {
    return <Navigate to="/dashboard" replace />;
  }

  const sendAlert = async () => {
    try {
      await api.post('/emergency/alert');
      alert(t('emergencyAlertSent') || 'Emergency alert sent to your emergency contacts');
    } catch (error) {
      console.error('Error sending alert:', error);
      alert(t('emergencyAlertError') || 'Failed to send emergency alert. Please try again.');
    }
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      padding: '2rem 1rem',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div ref={boxRef} style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            👤 {t('patientDashboard') || 'Patient Dashboard'}
          </h2>

          <p style={{
            color: '#6b7280',
            marginBottom: '2rem',
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            {t('quickAccessVitalsReports') || 'Quickly access vitals, reports and emergency services.'}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Emergency Alert */}
            <button
              onClick={sendAlert}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '2rem' }}>🚨</span>
              {t('sendEmergencyAlert') || 'Send Emergency Alert'}
            </button>

            {/* Find Hospitals */}
            <button
              onClick={() => setShowEmergencyLocation(true)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '2rem' }}>🏥</span>
              {t('findNearestHospital') || 'Find Nearest Hospital'}
            </button>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{
              color: '#1f2937',
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: '600'
            }}>
              📊 {t('fullDashboard') || 'Full Dashboard'}
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem'
            }}>
              {t('accessFullDashboardDesc') || 'Access your complete health dashboard with vitals tracking, medication management, and family connections.'}
            </p>
            <a
              href="/dashboard"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'inline-block',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {t('goToDashboard') || 'Go to Dashboard'} →
            </a>
          </div>
        </div>

        {/* Appointment Scheduler */}
        <div style={{ marginTop: '2rem' }}>
          <AppointmentScheduler userRole="patient" />
        </div>
      </div>

      {/* Emergency Location Service */}
      <EmergencyLocationService
        isOpen={showEmergencyLocation}
        onClose={() => setShowEmergencyLocation(false)}
      />
    </div>
  );
}

