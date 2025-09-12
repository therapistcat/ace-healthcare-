import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function VitalsTracker() {
  const { t } = useTranslation();
  const [vitals, setVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    bloodSugar: '',
    weight: '',
    temperature: '',
    oxygenSaturation: ''
  });
  const [recentVitals, setRecentVitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRecentVitals();
  }, []);

  const fetchRecentVitals = async () => {
    try {
      const { data } = await api.get('/health/vitals-simple');
      setRecentVitals(data?.data || []);
    } catch (error) {
      console.error('Error fetching vitals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const vitalsData = {
        bloodPressure: {
          systolic: parseInt(vitals.bloodPressureSystolic),
          diastolic: parseInt(vitals.bloodPressureDiastolic)
        },
        heartRate: parseInt(vitals.heartRate),
        bloodSugar: parseFloat(vitals.bloodSugar),
        weight: parseFloat(vitals.weight),
        temperature: parseFloat(vitals.temperature),
        oxygenSaturation: parseInt(vitals.oxygenSaturation),
        recordedAt: new Date()
      };

      await api.post('/health/vitals-simple', vitalsData);
      setMessage('Vitals recorded successfully! 🎉');
      setVitals({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        bloodSugar: '',
        weight: '',
        temperature: '',
        oxygenSaturation: ''
      });
      fetchRecentVitals();
    } catch (error) {
      setMessage('Error recording vitals. Please try again.');
      console.error('Error saving vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVitalStatus = (type, value) => {
    const ranges = {
      systolic: { normal: [90, 120], warning: [120, 140], danger: [140, 999] },
      diastolic: { normal: [60, 80], warning: [80, 90], danger: [90, 999] },
      heartRate: { normal: [60, 100], warning: [100, 120], danger: [120, 999] },
      bloodSugar: { normal: [70, 140], warning: [140, 180], danger: [180, 999] },
      temperature: { normal: [97, 99], warning: [99, 101], danger: [101, 999] },
      oxygenSaturation: { normal: [95, 100], warning: [90, 95], danger: [0, 90] }
    };

    const range = ranges[type];
    if (!range || !value) return 'normal';

    if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
    if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
    return 'danger';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return '#16a34a';
      case 'warning': return '#f59e0b';
      case 'danger': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Add New Vitals */}
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
          ❤️ Record Today's Vitals
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

        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Blood Pressure */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                🩸 Blood Pressure (mmHg)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Systolic"
                  value={vitals.bloodPressureSystolic}
                  onChange={(e) => setVitals({...vitals, bloodPressureSystolic: e.target.value})}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <span style={{ alignSelf: 'center', color: '#6b7280' }}>/</span>
                <input
                  type="number"
                  placeholder="Diastolic"
                  value={vitals.bloodPressureDiastolic}
                  onChange={(e) => setVitals({...vitals, bloodPressureDiastolic: e.target.value})}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {/* Heart Rate */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                💓 Heart Rate (bpm)
              </label>
              <input
                type="number"
                placeholder="e.g., 72"
                value={vitals.heartRate}
                onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
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

            {/* Blood Sugar */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                🍯 Blood Sugar (mg/dL)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 95"
                value={vitals.bloodSugar}
                onChange={(e) => setVitals({...vitals, bloodSugar: e.target.value})}
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

            {/* Weight */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                ⚖️ Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 70.5"
                value={vitals.weight}
                onChange={(e) => setVitals({...vitals, weight: e.target.value})}
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

            {/* Temperature */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                🌡️ Temperature (°F)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 98.6"
                value={vitals.temperature}
                onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
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

            {/* Oxygen Saturation */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                🫁 Oxygen Saturation (%)
              </label>
              <input
                type="number"
                placeholder="e.g., 98"
                value={vitals.oxygenSaturation}
                onChange={(e) => setVitals({...vitals, oxygenSaturation: e.target.value})}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Recording...' : '📝 Record Vitals'}
          </button>
        </form>
      </div>

      {/* Recent Vitals */}
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
          📊 Recent Vitals History
        </h3>

        {recentVitals.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No vitals recorded yet. Start tracking your health today! 🌟
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>BP</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>HR</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>Sugar</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>Weight</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>Temp</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#1f2937' }}>O2</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.slice(0, 10).map((vital, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                      {new Date(vital.recordedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: getStatusColor(getVitalStatus('systolic', vital.bloodPressure?.systolic))
                      }}>
                        {vital.bloodPressure?.systolic}/{vital.bloodPressure?.diastolic}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: getStatusColor(getVitalStatus('heartRate', vital.heartRate))
                      }}>
                        {vital.heartRate}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: getStatusColor(getVitalStatus('bloodSugar', vital.bloodSugar))
                      }}>
                        {vital.bloodSugar}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>{vital.weight}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: getStatusColor(getVitalStatus('temperature', vital.temperature))
                      }}>
                        {vital.temperature}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        color: getStatusColor(getVitalStatus('oxygenSaturation', vital.oxygenSaturation))
                      }}>
                        {vital.oxygenSaturation}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
