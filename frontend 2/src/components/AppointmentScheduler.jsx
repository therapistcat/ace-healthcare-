import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function AppointmentScheduler({ userRole = 'patient' }) {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation', icon: '🩺' },
    { value: 'followup', label: 'Follow-up Visit', icon: '📋' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'checkup', label: 'Regular Checkup', icon: '❤️' },
    { value: 'vaccination', label: 'Vaccination', icon: '💉' }
  ];

  useEffect(() => {
    fetchAppointments();
    if (userRole === 'patient') {
      fetchDoctors();
    } else if (userRole === 'doctor') {
      fetchPatients();
    }
  }, [userRole]);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data?.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/users/doctors');
      setDoctors(data?.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/users/patients');
      setPatients(data?.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const appointmentData = {
        doctorId: userRole === 'patient' ? selectedDoctor : JSON.parse(localStorage.getItem('user')).id,
        patientId: userRole === 'doctor' ? selectedPatient : JSON.parse(localStorage.getItem('user')).id,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes,
        status: 'pending'
      };

      await api.post('/appointments', appointmentData);
      setMessage('Appointment booked successfully!');
      setShowBookingForm(false);
      fetchAppointments();
      
      // Reset form
      setSelectedDoctor('');
      setSelectedPatient('');
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('consultation');
      setNotes('');
    } catch (error) {
      setMessage('Error booking appointment. Please try again.');
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status });
      setMessage(`Appointment ${status} successfully!`);
      fetchAppointments();
    } catch (error) {
      setMessage('Error updating appointment status.');
      console.error('Error updating appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#dc2626';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📅 {userRole === 'patient' ? 'Book Appointment' : 'Manage Appointments'}
        </h2>
        
        <button
          onClick={() => setShowBookingForm(!showBookingForm)}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          {showBookingForm ? '❌ Cancel' : '➕ New Appointment'}
        </button>
      </div>

      {message && (
        <div style={{
          background: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
          color: message.includes('Error') ? '#dc2626' : '#16a34a',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {message}
        </div>
      )}

      {/* Booking Form */}
      {showBookingForm && (
        <div style={{
          background: '#f8fafc',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            📝 Schedule New Appointment
          </h3>

          <form onSubmit={handleBookAppointment}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Doctor Selection (for patients) */}
              {userRole === 'patient' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    👨‍⚕️ Select Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} - {doctor.specialization || 'General Medicine'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Patient Selection (for doctors) */}
              {userRole === 'doctor' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: '#1f2937'
                  }}>
                    👤 Select Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} - {patient.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  📅 Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  🕐 Appointment Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select time...</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Appointment Type */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  🏥 Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  {appointmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                📝 Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '1rem 2rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                width: '100%'
              }}
            >
              {loading ? '⏳ Booking...' : '✅ Book Appointment'}
            </button>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '1.5rem'
        }}>
          📋 {userRole === 'patient' ? 'Your Appointments' : 'Patient Appointments'}
        </h3>

        {appointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              No appointments scheduled yet
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {appointments.map(appointment => (
              <div
                key={appointment._id}
                style={{
                  background: '#f8fafc',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        background: getStatusColor(appointment.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {appointment.status}
                      </span>
                      <span style={{
                        background: '#e5e7eb',
                        color: '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {appointmentTypes.find(t => t.value === appointment.type)?.icon} {appointmentTypes.find(t => t.value === appointment.type)?.label}
                      </span>
                    </div>

                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {userRole === 'patient'
                        ? `Dr. ${appointment.doctor?.name || 'Unknown Doctor'}`
                        : appointment.patient?.name || 'Unknown Patient'
                      }
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      color: '#6b7280',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        📅 {formatDate(appointment.date)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        🕐 {appointment.time}
                      </div>
                    </div>

                    {appointment.notes && (
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        margin: '0.75rem 0 0 0',
                        fontStyle: 'italic'
                      }}>
                        "{appointment.notes}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons for Doctors */}
                  {userRole === 'doctor' && appointment.status === 'pending' && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginLeft: '1rem'
                    }}>
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                        style={{
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}

                  {/* Complete Button for Doctors */}
                  {userRole === 'doctor' && appointment.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                      style={{
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        marginLeft: '1rem'
                      }}
                    >
                      ✅ Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
