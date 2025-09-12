import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ImageRecognition from './ImageRecognition';

export default function MedicationTracker() {
  const { t } = useTranslation();
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    instructions: ''
  });
  const [todaysTaken, setTodaysTaken] = useState({});
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  const [showPhotoVerification, setShowPhotoVerification] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);

  useEffect(() => {
    fetchMedications();
    fetchTodaysTaken();
    fetchGameStats();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data } = await api.get('/health/medications');
      setMedications(data?.data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const fetchTodaysTaken = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await api.get(`/health/medication-logs?date=${today}`);
      const taken = {};
      data?.data?.forEach(log => {
        taken[`${log.medicationId}-${log.scheduledTime}`] = true;
      });
      setTodaysTaken(taken);
    } catch (error) {
      console.error('Error fetching medication logs:', error);
    }
  };

  const fetchGameStats = async () => {
    try {
      const { data } = await api.get('/health/medication-stats');
      setStreak(data?.data?.streak || 0);
      setPoints(data?.data?.points || 0);
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  const addMedication = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/health/medications', newMedication);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: ['09:00'],
        instructions: ''
      });
      setShowAddForm(false);
      fetchMedications();
    } catch (error) {
      console.error('Error adding medication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRecognitionResult = (result) => {
    const { processedData } = result;
    if (processedData.name) {
      setNewMedication(prev => ({
        ...prev,
        name: processedData.name,
        dosage: processedData.dosage || prev.dosage,
        instructions: processedData.instructions || prev.instructions
      }));
      setShowAddForm(true);
    }
    setShowImageRecognition(false);
  };

  const markAsTaken = (medicationId, scheduledTime) => {
    setCurrentMedication({ medicationId, scheduledTime });
    setShowPhotoVerification(true);
  };

  const confirmMedicationTaken = async (verificationPhoto = null, notes = '') => {
    try {
      const logData = {
        medicationId: currentMedication.medicationId,
        scheduledTime: currentMedication.scheduledTime,
        takenAt: new Date(),
        status: 'taken',
        verificationPhoto: verificationPhoto,
        notes: notes
      };

      // Get location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            logData.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            await submitMedicationLog(logData);
          },
          async () => {
            // Location not available, submit without it
            await submitMedicationLog(logData);
          }
        );
      } else {
        await submitMedicationLog(logData);
      }
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      alert('Failed to log medication. Please try again.');
    }
  };

  const submitMedicationLog = async (logData) => {
    try {
      await api.post('/health/medication-logs', logData);

      setTodaysTaken(prev => ({
        ...prev,
        [`${currentMedication.medicationId}-${currentMedication.scheduledTime}`]: true
      }));

      // Update game stats
      setPoints(prev => prev + 10);
      fetchGameStats();

      setShowPhotoVerification(false);
      setCurrentMedication(null);

      // Show success message
      alert('✅ Medication logged successfully! +10 points');
    } catch (error) {
      console.error('Error submitting medication log:', error);
      throw error;
    }
  };

  const getCompletionPercentage = () => {
    const totalDoses = medications.reduce((total, med) => total + med.times.length, 0);
    const takenDoses = Object.keys(todaysTaken).length;
    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⭐';
    if (streak >= 3) return '🌟';
    return '💊';
  };

  const addTimeSlot = () => {
    setNewMedication(prev => ({
      ...prev,
      times: [...prev.times, '12:00']
    }));
  };

  const removeTimeSlot = (index) => {
    setNewMedication(prev => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, time) => {
    setNewMedication(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Gamification Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: '12px',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{getStreakEmoji()}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{streak}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Day Streak</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{getCompletionPercentage()}%</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Today's Progress</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{points}</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Points</div>
          </div>
        </div>
      </div>

      {/* Today's Medications */}
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
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            💊 Today's Medications
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              + Add Medication
            </button>

            <button
              onClick={() => setShowImageRecognition(true)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              📷 Scan
            </button>
          </div>
        </div>

        {medications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</div>
            <p>No medications added yet.</p>
            <p>Start by adding your first medication!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {medications.map(medication => (
              <div key={medication._id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {medication.name}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem'
                    }}>
                      {medication.dosage} • {medication.frequency}
                    </p>
                    {medication.instructions && (
                      <p style={{
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '0.875rem',
                        fontStyle: 'italic'
                      }}>
                        {medication.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {medication.times.map((time, index) => {
                    const key = `${medication._id}-${time}`;
                    const isTaken = todaysTaken[key];
                    
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: isTaken ? '#f0fdf4' : '#f9fafb',
                        borderRadius: '8px',
                        border: `1px solid ${isTaken ? '#bbf7d0' : '#e5e7eb'}`
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>
                            {isTaken ? '✅' : '⏰'}
                          </span>
                          <span style={{
                            fontWeight: '500',
                            color: isTaken ? '#16a34a' : '#1f2937'
                          }}>
                            {time}
                          </span>
                        </div>
                        
                        {!isTaken && (
                          <button
                            onClick={() => markAsTaken(medication._id, time)}
                            style={{
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              color: 'white',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Take Now (+10 pts)
                          </button>
                        )}
                        
                        {isTaken && (
                          <span style={{
                            color: '#16a34a',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            ✓ Taken
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              Add New Medication
            </h3>

            <form onSubmit={addMedication}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., Aspirin"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  Dosage
                </label>
                <input
                  type="text"
                  required
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., 100mg"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  Frequency
                </label>
                <select
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="twice-daily">Twice Daily</option>
                  <option value="three-times-daily">Three Times Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="as-needed">As Needed</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  Times
                </label>
                {newMedication.times.map((time, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    />
                    {newMedication.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  + Add Time
                </button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1f2937'
                }}>
                  Instructions (Optional)
                </label>
                <textarea
                  value={newMedication.instructions}
                  onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="e.g., Take with food"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Adding...' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Recognition Modal */}
      {showImageRecognition && (
        <ImageRecognition
          type="pill"
          onResult={handleImageRecognitionResult}
          onClose={() => setShowImageRecognition(false)}
        />
      )}

      {/* Photo Verification Modal */}
      {showPhotoVerification && currentMedication && (
        <PhotoVerificationModal
          medicationId={currentMedication.medicationId}
          scheduledTime={currentMedication.scheduledTime}
          onConfirm={confirmMedicationTaken}
          onCancel={() => {
            setShowPhotoVerification(false);
            setCurrentMedication(null);
          }}
        />
      )}
    </div>
  );
}

// Photo Verification Modal Component
function PhotoVerificationModal({ medicationId, scheduledTime, onConfirm, onCancel }) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoCapture = (result) => {
    setCapturedPhoto(result.image);
    setShowCamera(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(capturedPhoto, notes);
    } catch (error) {
      console.error('Error confirming medication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPhoto = async () => {
    setLoading(true);
    try {
      await onConfirm(null, notes);
    } catch (error) {
      console.error('Error confirming medication:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          📸 Verify Medication Taken
        </h3>

        <p style={{
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.875rem'
        }}>
          Take a photo to verify you've taken your medication at {scheduledTime}
        </p>

        {/* Photo Section */}
        <div style={{
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: capturedPhoto ? '#f0fdf4' : '#f9fafb'
        }}>
          {capturedPhoto ? (
            <div>
              <img
                src={capturedPhoto}
                alt="Verification photo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              />
              <p style={{
                color: '#16a34a',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                ✅ Photo captured successfully!
              </p>
              <button
                onClick={() => setShowCamera(true)}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  color: '#6b7280',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                📷 Retake Photo
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <button
                onClick={() => setShowCamera(true)}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                📸 Take Verification Photo
              </button>
              <p style={{
                color: '#6b7280',
                fontSize: '0.75rem',
                marginTop: '0.5rem'
              }}>
                Optional: Take a photo of yourself taking the medication
              </p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any side effects?"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              minHeight: '80px',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#6b7280',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              flex: '1'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSkipPhoto}
            disabled={loading}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
              background: 'white',
              color: '#f59e0b',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              flex: '1'
            }}
          >
            Skip Photo
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              flex: '1'
            }}
          >
            {loading ? 'Confirming...' : '✅ Confirm Taken'}
          </button>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <ImageRecognition
            type="verification"
            onResult={handlePhotoCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}
