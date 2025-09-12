import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ImageRecognition from './ImageRecognition';

export default function PrescriptionScanner() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/prescriptions');
      setPrescriptions(data?.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // Mock data for demo
      setPrescriptions([
        {
          _id: '1',
          doctor: 'Dr. Sarah Johnson, MD',
          date: '2024-01-15',
          medications: [
            {
              name: 'Lisinopril',
              dosage: '10mg',
              instructions: 'Take once daily in the morning'
            },
            {
              name: 'Metformin',
              dosage: '500mg',
              instructions: 'Take twice daily with meals'
            }
          ],
          originalImage: null,
          extractedText: 'Dr. Sarah Johnson, MD\nLisinopril 10mg - Take once daily\nMetformin 500mg - Take twice daily with meals',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRecognitionResult = async (result) => {
    const { processedData, originalText, image } = result;
    
    try {
      setLoading(true);
      
      // Create prescription record
      const prescriptionData = {
        doctor: processedData.doctor,
        medications: processedData.medications,
        originalImage: image,
        extractedText: originalText,
        status: 'active',
        date: new Date().toISOString().split('T')[0]
      };

      const { data } = await api.post('/health/prescriptions', prescriptionData);
      if (data.success) {
        setPrescriptions(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      // Add to local state for demo
      const mockPrescription = {
        _id: Date.now().toString(),
        doctor: processedData.doctor,
        medications: processedData.medications,
        originalImage: image,
        extractedText: originalText,
        status: 'active',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      setPrescriptions(prev => [mockPrescription, ...prev]);
    } finally {
      setLoading(false);
    }
    
    setShowImageRecognition(false);
  };

  const addMedicationsFromPrescription = async (prescription) => {
    try {
      setLoading(true);
      
      // Add each medication from the prescription
      for (const med of prescription.medications) {
        const medicationData = {
          name: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          frequency: 'daily', // Default, user can modify later
          times: ['09:00'], // Default time
          prescriptionId: prescription._id
        };
        
        await api.post('/health/medications', medicationData);
      }
      
      alert(`Added ${prescription.medications.length} medications to your tracker!`);
    } catch (error) {
      console.error('Error adding medications:', error);
      alert('Some medications could not be added. Please add them manually.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'completed': return '#6b7280';
      case 'expired': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
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
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              📝 Prescription Scanner
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '0.875rem'
            }}>
              Scan handwritten or printed prescriptions to automatically extract medication information
            </p>
          </div>
          
          <button
            onClick={() => setShowImageRecognition(true)}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📷 Scan Prescription
          </button>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            background: '#f0fdf4',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✍️</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
              Handwriting Recognition
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Reads doctor's handwritten prescriptions
            </div>
          </div>

          <div style={{
            background: '#f0f9ff',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
              Smart Extraction
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Automatically identifies medications & dosages
            </div>
          </div>

          <div style={{
            background: '#fef7ff',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💊</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem' }}>
              Auto-Add to Tracker
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Adds medications to your daily tracker
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1.5rem'
        }}>
          📋 Scanned Prescriptions
        </h3>

        {prescriptions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p>No prescriptions scanned yet.</p>
            <p>Start by scanning your first prescription!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {prescriptions.map(prescription => (
              <div key={prescription._id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#d1fae5';
                e.currentTarget.style.background = '#f0fdf4';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = 'white';
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {prescription.doctor || 'Unknown Doctor'}
                    </h4>
                    <p style={{
                      color: '#6b7280',
                      margin: 0,
                      fontSize: '0.875rem'
                    }}>
                      Date: {new Date(prescription.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      background: getStatusColor(prescription.status) + '20',
                      color: getStatusColor(prescription.status),
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {prescription.status}
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div style={{ marginBottom: '1rem' }}>
                  <h5 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Medications:
                  </h5>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {prescription.medications?.map((med, index) => (
                      <div key={index} style={{
                        background: '#f9fafb',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{
                              fontWeight: '600',
                              color: '#1f2937'
                            }}>
                              {med.name}
                            </span>
                            {med.dosage && (
                              <span style={{
                                color: '#6b7280',
                                marginLeft: '0.5rem'
                              }}>
                                {med.dosage}
                              </span>
                            )}
                          </div>
                        </div>
                        {med.instructions && (
                          <p style={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            margin: '0.25rem 0 0 0'
                          }}>
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => addMedicationsFromPrescription(prescription)}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    💊 Add to Medication Tracker
                  </button>
                  
                  <button
                    onClick={() => setSelectedPrescription(prescription)}
                    style={{
                      background: 'white',
                      color: '#6b7280',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Recognition Modal */}
      {showImageRecognition && (
        <ImageRecognition
          type="prescription"
          onResult={handleImageRecognitionResult}
          onClose={() => setShowImageRecognition(false)}
        />
      )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                Prescription Details
              </h3>
              <button
                onClick={() => setSelectedPrescription(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {selectedPrescription.originalImage && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Original Image:
                </h4>
                <img
                  src={selectedPrescription.originalImage}
                  alt="Original prescription"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Extracted Text:
              </h4>
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {selectedPrescription.extractedText}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedPrescription(null)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
