import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import HealthCharts from '../components/HealthCharts';
import DoctorChatbot from '../components/DoctorChatbot';
import AppointmentScheduler from '../components/AppointmentScheduler';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(true);
  const [patientVitals, setPatientVitals] = useState([]);
  const [patientMedications, setPatientMedications] = useState([]);

  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
    if (userData) {
      fetchPatients();
    }
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientData(selectedPatient._id);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/doctor/patients');
      setPatients(data?.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Mock data for demo
      setPatients([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          age: 45,
          gender: 'male',
          lastVisit: new Date().toISOString(),
          conditions: ['Hypertension', 'Diabetes'],
          riskLevel: 'medium'
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: 32,
          gender: 'female',
          lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          conditions: ['Asthma'],
          riskLevel: 'low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async (patientId) => {
    try {
      const [vitalsResponse, medicationsResponse] = await Promise.all([
        api.get(`/health/vitals-simple?userId=${patientId}`),
        api.get(`/health/medications?userId=${patientId}`)
      ]);

      setPatientVitals(vitalsResponse.data?.data || []);
      setPatientMedications(medicationsResponse.data?.data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const tabs = [
    { id: 'patients', name: t('patientList') || 'My Patients', icon: '👥' },
    { id: 'analytics', name: t('analytics') || 'Patient Analytics', icon: '📊' },
    { id: 'alerts', name: t('healthAlerts') || 'Health Alerts', icon: '🚨' },
    { id: 'appointments', name: t('appointments') || 'Appointments', icon: '📅' },
    { id: 'emergency', name: t('emergency') || 'Emergency', icon: '🆘' }
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
            👨‍⚕️ Doctor Dashboard
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>
            Monitor your patients' health data, track progress, and manage care plans.
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
        {activeTab === 'patients' && (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Patients List */}
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
                👥 Patient List
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Loading patients...
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {patients.map(patient => (
                    <div
                      key={patient._id}
                      onClick={() => setSelectedPatient(patient)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        border: selectedPatient?._id === patient._id ? '2px solid #059669' : '1px solid #e5e7eb',
                        borderRadius: '8px',
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
                          width: '3rem',
                          height: '3rem',
                          background: '#f3f4f6',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          {patient.gender === 'male' ? '👨' : '👩'}
                        </div>

                        <div>
                          <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {patient.name}
                          </h3>
                          <p style={{
                            color: '#6b7280',
                            margin: '0 0 0.25rem 0',
                            fontSize: '0.875rem'
                          }}>
                            Age: {patient.age} • {patient.email}
                          </p>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                          }}>
                            {patient.conditions?.map((condition, index) => (
                              <span
                                key={index}
                                style={{
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          background: getRiskLevelColor(patient.riskLevel) + '20',
                          color: getRiskLevelColor(patient.riskLevel),
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getRiskLevelColor(patient.riskLevel)
                          }}></div>
                          {patient.riskLevel?.toUpperCase()} RISK
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Patient Details */}
            {selectedPatient && (
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
                  📋 {selectedPatient.name}'s Health Summary
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      {patientVitals.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Vitals Recorded
                    </div>
                  </div>

                  <div style={{
                    background: '#f0f9ff',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💊</div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      {patientMedications.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Active Medications
                    </div>
                  </div>

                  <div style={{
                    background: '#fef7ff',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      {selectedPatient.riskLevel?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Risk Level
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📝 Add Notes
                  </button>

                  <button style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    📅 Schedule Appointment
                  </button>

                  <button style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    💊 Prescribe Medication
                  </button>
                </div>
              </div>
            )}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Select a Patient</h3>
            <p style={{ color: '#6b7280' }}>
              Choose a patient from the "My Patients" tab to view their health analytics and charts.
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
              🚨 Health Alerts
            </h2>

            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#dc2626', fontSize: '1.25rem' }}>⚠️</span>
                <strong style={{ color: '#dc2626' }}>High Blood Pressure Alert</strong>
              </div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                John Doe recorded BP of 180/95 - requires immediate attention
              </p>
            </div>

            <div style={{
              background: '#fffbeb',
              border: '1px solid #fed7aa',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#f59e0b', fontSize: '1.25rem' }}>💊</span>
                <strong style={{ color: '#f59e0b' }}>Medication Missed</strong>
              </div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                Jane Smith missed her evening medication for 2 consecutive days
              </p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <AppointmentScheduler userRole="doctor" />
        )}

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
              fontWeight: '700'
            }}>
              🆘 {t('emergencyServices') || 'Emergency Services'}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>


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
                  {t('quickAccessEmergencyNumbers') || 'Quick access to emergency numbers and patient emergency contacts'}
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

              {/* Patient Emergency Alerts */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                border: '2px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
                <h4 style={{
                  color: '#2563eb',
                  marginBottom: '1rem',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {t('patientAlerts') || 'Patient Alerts'}
                </h4>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {t('monitorPatientEmergencyAlerts') || 'Monitor and respond to patient emergency alerts and critical health notifications'}
                </p>
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ⚠️ 2 Active Alerts
                  </div>
                  <div style={{
                    color: '#6b7280',
                    fontSize: '0.7rem',
                    marginTop: '0.25rem'
                  }}>
                    High BP readings, Missed medications
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Doctor AI Chatbot */}
      <DoctorChatbot
        selectedPatient={selectedPatient}
        patientData={patientData}
      />


    </div>
  );
}

