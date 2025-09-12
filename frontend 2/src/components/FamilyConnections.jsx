import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function FamilyConnections() {
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

  const sendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/family/invite', {
        email: inviteEmail,
        role: inviteRole,
        permissions: ['view_vitals', 'view_medications', 'receive_alerts']
      });
      
      setMessage('Invitation sent successfully! 🎉');
      setInviteEmail('');
      fetchConnections();
    } catch (error) {
      setMessage('Error sending invitation. Please try again.');
      console.error('Error sending invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeConnection = async (connectionId) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      await api.delete(`/family/connections/${connectionId}`);
      fetchConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'family': return '👨‍👩‍👧‍👦';
      case 'caregiver': return '👩‍⚕️';
      case 'doctor': return '👨‍⚕️';
      default: return '👤';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Medication Alerts */}
      {notifications.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🚨 Recent Medication Alerts
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {notifications.slice(0, 3).map((notification, index) => (
              <div key={index} style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <p style={{ color: '#dc2626', margin: 0, fontSize: '0.875rem' }}>
                  <strong>{notification.title}</strong>
                </p>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Connection */}
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
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          👨‍👩‍👧‍👦 Invite Family & Caregivers
        </h2>

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

        <form onSubmit={sendInvite}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minWidth: '120px'
                }}
              >
                <option value="family">Family Member</option>
                <option value="caregiver">Caregiver</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

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
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#16a34a',
            margin: '0 0 0.5rem 0'
          }}>
            What they'll be able to do:
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: '#16a34a',
            fontSize: '0.875rem'
          }}>
            <li>View your vital signs and health trends</li>
            <li>Monitor your medication adherence</li>
            <li>Receive alerts when medications are missed</li>
            <li>Access emergency contact information</li>
          </ul>
        </div>
      </div>

      {/* Current Connections */}
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
          👥 Your Care Network
        </h3>

        {connections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
            <p>No connections yet.</p>
            <p>Invite family members and caregivers to join your care network!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {connections.map(connection => (
              <div key={connection._id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}>
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
                    {getRoleIcon(connection.role)}
                  </div>
                  
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
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
                      {connection.role.charAt(0).toUpperCase() + connection.role.slice(1)}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(connection.status)
                      }}></div>
                      <span style={{
                        fontSize: '0.75rem',
                        color: getStatusColor(connection.status),
                        fontWeight: '500'
                      }}>
                        {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {connection.permissions?.includes('receive_alerts') && (
                    <span style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      🔔 Alerts
                    </span>
                  )}
                  
                  <button
                    onClick={() => removeConnection(connection._id)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        borderRadius: '12px',
        padding: '2rem',
        color: 'white'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🚨 Emergency Contacts
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚑</div>
            <div style={{ fontWeight: 'bold' }}>Emergency Services</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>911</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>☎️</div>
            <div style={{ fontWeight: 'bold' }}>Poison Control</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>1-800-222-1222</div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🏥</div>
            <div style={{ fontWeight: 'bold' }}>Your Doctor</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {connections.find(c => c.role === 'doctor')?.name || 'Not connected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
