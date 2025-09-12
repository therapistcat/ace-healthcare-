import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function EnhancedFamilyConnections() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newConnection, setNewConnection] = useState({
    email: '',
    role: 'family',
    relationship: '',
    message: ''
  });

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
  }, []);

  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/health/my-connections');
      if (data.success) {
        setConnections(data.data.received || []);
        setSentRequests(data.data.sent || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data } = await api.get('/health/pending-connections');
      if (data.success) {
        setPendingRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const sendConnectionRequest = async (e) => {
    e.preventDefault();
    if (!newConnection.email.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/health/connection-request', {
        targetEmail: newConnection.email,
        myRole: newConnection.role,
        relationship: newConnection.relationship,
        message: newConnection.message
      });

      if (data.success) {
        alert('Connection request sent successfully!');
        setNewConnection({
          email: '',
          role: 'family',
          relationship: '',
          message: ''
        });
        setShowAddForm(false);
        fetchConnections();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert(error.response?.data?.message || 'Failed to send connection request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (connectionId, response) => {
    setLoading(true);
    try {
      const { data } = await api.post('/health/connection-response', {
        connectionId,
        response
      });

      if (data.success) {
        alert(`Connection request ${response}ed successfully!`);
        fetchConnections();
        fetchPendingRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to connection request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return '👨‍⚕️';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'caregiver': return '🤝';
      default: return '👤';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'declined': return '#dc2626';
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
              👨‍👩‍👧‍👦 Family & Care Network
            </h2>
            <p style={{
              color: '#6b7280',
              margin: 0,
              fontSize: '0.875rem'
            }}>
              Connect with family members, caregivers, and doctors to share your health information
            </p>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + Add Connection
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            background: '#f0fdf4',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
              {connections.filter(c => c.status === 'active').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Active Connections</div>
          </div>

          <div style={{
            background: '#fef3c7',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
              {pendingRequests.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pending Requests</div>
          </div>

          <div style={{
            background: '#e0f2fe',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤</div>
            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
              {sentRequests.filter(r => r.status === 'pending').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sent Requests</div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
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
            ⏳ Pending Connection Requests
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingRequests.map(request => (
              <div key={request._id} style={{
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '1.5rem',
                background: '#fffbeb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>
                      {getRoleIcon(request.role)}
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {request.name || request.email}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.875rem'
                      }}>
                        Wants to connect as: <strong>{request.role}</strong>
                      </p>
                      {request.relationship && (
                        <p style={{
                          color: '#6b7280',
                          margin: 0,
                          fontSize: '0.75rem'
                        }}>
                          Relationship: {request.relationship}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => respondToRequest(request._id, 'decline')}
                      disabled={loading}
                      style={{
                        background: 'white',
                        color: '#dc2626',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #dc2626',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ❌ Decline
                    </button>
                    
                    <button
                      onClick={() => respondToRequest(request._id, 'accept')}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ✅ Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Connections */}
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
          ✅ Active Connections
        </h3>

        {connections.filter(c => c.status === 'active').length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
            <p>No active connections yet.</p>
            <p>Start by adding family members, caregivers, or doctors!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {connections.filter(c => c.status === 'active').map(connection => (
              <div key={connection._id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
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
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>
                      {getRoleIcon(connection.role)}
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {connection.name || connection.email}
                      </h4>
                      <p style={{
                        color: '#6b7280',
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.875rem'
                      }}>
                        Role: <strong>{connection.role}</strong>
                      </p>
                      {connection.relationship && (
                        <p style={{
                          color: '#6b7280',
                          margin: 0,
                          fontSize: '0.75rem'
                        }}>
                          Relationship: {connection.relationship}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: getStatusColor(connection.status) + '20',
                    color: getStatusColor(connection.status),
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {connection.status}
                  </div>
                </div>

                {/* Permissions */}
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '6px'
                }}>
                  <h5 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Permissions:
                  </h5>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    fontSize: '0.75rem'
                  }}>
                    {connection.permissions?.viewVitals && (
                      <span style={{ color: '#16a34a' }}>✅ View Vitals</span>
                    )}
                    {connection.permissions?.viewMedications && (
                      <span style={{ color: '#16a34a' }}>✅ View Medications</span>
                    )}
                    {connection.permissions?.receiveAlerts && (
                      <span style={{ color: '#16a34a' }}>✅ Receive Alerts</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
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
              marginBottom: '1.5rem'
            }}>
              Add New Connection
            </h3>

            <form onSubmit={sendConnectionRequest}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={newConnection.email}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter their email address"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Your Role
                  </label>
                  <select
                    value={newConnection.role}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, role: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="family">Family Member</option>
                    <option value="caregiver">Caregiver</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={newConnection.relationship}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, relationship: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="e.g., Spouse, Child, Doctor"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Message (Optional)
                </label>
                <textarea
                  value={newConnection.message}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, message: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Add a personal message with your connection request"
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
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    color: '#6b7280',
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
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
