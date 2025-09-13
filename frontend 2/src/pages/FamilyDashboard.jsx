import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import HealthCharts from '../components/HealthCharts';

export default function FamilyDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [connectedPatients, setConnectedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
    if (userData) {
      fetchConnectedPatients();
      fetchAlerts();
    }
  }, []);

  const fetchConnectedPatients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/family/connected-patients');
      setConnectedPatients(data?.data || []);
    } catch (error) {
      console.error('Error fetching connected patients:', error);
      // Mock data for demo
      setConnectedPatients([
        {
          _id: '1',
          name: 'Mom (Sarah Johnson)',
          email: 'mom@example.com',
          relationship: 'Mother',
          age: 68,
          lastActivity: new Date().toISOString(),
          medicationCompliance: 85,
          recentVitals: {
            bloodPressure: { systolic: 140, diastolic: 90 },
            heartRate: 78,
            bloodSugar: 120
          },
          alerts: 2
        },
        {
          _id: '2',
          name: 'Dad (Robert Johnson)',
          email: 'dad@example.com',
          relationship: 'Father',
          age: 72,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          medicationCompliance: 92,
          recentVitals: {
            bloodPressure: { systolic: 125, diastolic: 80 },
            heartRate: 72,
            bloodSugar: 95
          },
          alerts: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/health/family/alerts');
      setAlerts(data?.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Mock alerts
      setAlerts([
        {
          _id: '1',
          patientName: 'Mom (Sarah Johnson)',
          type: 'medication_missed',
          message: 'Missed evening blood pressure medication',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          severity: 'medium'
        },
        {
          _id: '2',
          patientName: 'Mom (Sarah Johnson)',
          type: 'vitals_alert',
          message: 'Blood pressure reading above normal range (140/90)',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          severity: 'high'
        }
      ]);
    }
  };

  const getComplianceColor = (percentage) => {
    if (percentage >= 90) return '#16a34a';
    if (percentage >= 70) return '#f59e0b';
    return '#dc2626';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const tabs = [
    { id: 'patients', name: 'Connected Patients', icon: '👨‍👩‍👧‍👦' },
    { id: 'analytics', name: 'Health Analytics', icon: '📊' },
    { id: 'alerts', name: 'Alerts & Notifications', icon: '🔔' },
    { id: 'emergency', name: 'Emergency Contacts', icon: '🚨' }
  ];

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
            👨‍👩‍👧‍👦 Family & Caregiver Dashboard
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            Monitor your loved ones' health, receive alerts, and stay connected with their care.
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
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span style={{
                    background: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {alerts.length}
                  </span>
                )}
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
        {activeTab === 'patients' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Connected Patients */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1.5rem'
              }}>
                👨‍👩‍👧‍👦 Connected Family Members
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Loading connected patients...
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {connectedPatients.map(patient => (
                    <div
                      key={patient._id}
                      onClick={() => setSelectedPatient(patient)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '1rem',
                        padding: '1.5rem',
                        border: selectedPatient?._id === patient._id ? '2px solid #059669' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        if (selectedPatient?._id !== patient._id) {
                          e.currentTarget.style.borderColor = '#d1fae5';
                          e.currentTarget.style.background = '#f0fdf4';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedPatient?._id !== patient._id) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '4rem',
                          height: '4rem',
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: 'white'
                        }}>
                          👤
                        </div>

                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 0.5rem 0'
                          }}>
                            {patient.name}
                          </h3>
                          <p style={{
                            color: '#6b7280',
                            margin: '0 0 0.5rem 0',
                            fontSize: '0.875rem'
                          }}>
                            {patient.relationship} • Age {patient.age} • {patient.email}
                          </p>

                          {/* Health Summary */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '0.5rem',
                            marginTop: '1rem'
                          }}>
                            <div style={{
                              background: '#f0fdf4',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Blood Pressure</div>
                              <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
                                {patient.recentVitals?.bloodPressure?.systolic}/{patient.recentVitals?.bloodPressure?.diastolic}
                              </div>
                            </div>

                            <div style={{
                              background: '#f0f9ff',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Heart Rate</div>
                              <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
                                {patient.recentVitals?.heartRate} bpm
                              </div>
                            </div>

                            <div style={{
                              background: '#fef7ff',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Blood Sugar</div>
                              <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
                                {patient.recentVitals?.bloodSugar} mg/dL
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {/* Medication Compliance */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          justifyContent: 'flex-end'
                        }}>
                          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Medication:</span>
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: getComplianceColor(patient.medicationCompliance) + '20',
                            color: getComplianceColor(patient.medicationCompliance),
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {patient.medicationCompliance}%
                          </div>
                        </div>

                        {/* Alerts */}
                        {patient.alerts > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'flex-end'
                          }}>
                            <span style={{ color: '#dc2626', fontSize: '1rem' }}>🚨</span>
                            <span style={{ color: '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
                              {patient.alerts} Alert{patient.alerts > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {/* Last Activity */}
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Last activity: {new Date(patient.lastActivity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && selectedPatient && (
          <HealthCharts userId={selectedPatient._id} />
        )}

        {activeTab === 'analytics' && !selectedPatient && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Select a Family Member</h3>
            <p style={{ color: '#6b7280' }}>
              Choose a connected family member from the "Connected Patients" tab to view their health analytics.
            </p>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              🔔 Alerts & Notifications
            </h2>

            {alerts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>All Good!</h3>
                <p>No alerts at this time. Your family members are doing well.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {alerts.map(alert => (
                  <div
                    key={alert._id}
                    style={{
                      background: getSeverityColor(alert.severity) + '10',
                      border: `1px solid ${getSeverityColor(alert.severity)}40`,
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: getSeverityColor(alert.severity), fontSize: '1.25rem' }}>
                        {alert.type === 'medication_missed' ? '💊' : '⚠️'}
                      </span>
                      <strong style={{ color: getSeverityColor(alert.severity) }}>
                        {alert.patientName}
                      </strong>
                      <span style={{
                        background: getSeverityColor(alert.severity),
                        color: 'white',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </span>
                    </div>
                    <p style={{ color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                      {alert.message}
                    </p>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              🚨 {t('emergencyServices') || 'Emergency Services'}
            </h2>



            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3 style={{ color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🚑 Emergency Services
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Emergency:</strong> 911
                  </div>
                  <div>
                    <strong>Poison Control:</strong> 1-800-222-1222
                  </div>
                  <div>
                    <strong>Crisis Hotline:</strong> 988
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3 style={{ color: '#16a34a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏥 Healthcare Providers
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div>
                    <strong>Primary Care:</strong> Dr. Smith - (555) 123-4567
                  </div>
                  <div>
                    <strong>Cardiologist:</strong> Dr. Johnson - (555) 234-5678
                  </div>
                  <div>
                    <strong>Pharmacy:</strong> Main Street Pharmacy - (555) 345-6789
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}

