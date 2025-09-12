import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';
import api from '../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function HealthCharts({ userId = null }) {
  const [vitalsData, setVitalsData] = useState([]);
  const [medicationData, setMedicationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days

  useEffect(() => {
    fetchHealthData();
  }, [timeRange, userId]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const endpoint = userId ? `/health/vitals-simple?userId=${userId}` : '/health/vitals-simple';
      const { data: vitalsResponse } = await api.get(endpoint);
      const { data: medicationResponse } = await api.get(userId ? `/health/medication-logs?userId=${userId}` : '/health/medication-logs');
      
      setVitalsData(vitalsResponse?.data || []);
      setMedicationData(medicationResponse?.data || []);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (data, days) => {
    const cutoffDate = subDays(new Date(), parseInt(days));
    return data.filter(item => new Date(item.recordedAt || item.createdAt) >= cutoffDate);
  };

  const prepareVitalsChartData = () => {
    const filteredData = getFilteredData(vitalsData, timeRange);
    const sortedData = filteredData.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    
    const labels = sortedData.map(item => format(new Date(item.recordedAt), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Systolic BP',
          data: sortedData.map(item => item.bloodPressure?.systolic || null),
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Diastolic BP',
          data: sortedData.map(item => item.bloodPressure?.diastolic || null),
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Heart Rate',
          data: sortedData.map(item => item.heartRate || null),
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const prepareBloodSugarChartData = () => {
    const filteredData = getFilteredData(vitalsData, timeRange);
    const sortedData = filteredData.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    
    const labels = sortedData.map(item => format(new Date(item.recordedAt), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Blood Sugar (mg/dL)',
          data: sortedData.map(item => item.bloodSugar || null),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const prepareWeightChartData = () => {
    const filteredData = getFilteredData(vitalsData, timeRange);
    const sortedData = filteredData.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    
    const labels = sortedData.map(item => format(new Date(item.recordedAt), 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'Weight (kg)',
          data: sortedData.map(item => item.weight || null),
          backgroundColor: '#0ea5e9',
          borderColor: '#0ea5e9',
          borderWidth: 2,
        },
      ],
    };
  };

  const prepareMedicationComplianceData = () => {
    const filteredData = getFilteredData(medicationData, timeRange);
    const takenCount = filteredData.filter(item => item.status === 'taken').length;
    const missedCount = filteredData.filter(item => item.status === 'missed').length;
    const skippedCount = filteredData.filter(item => item.status === 'skipped').length;
    
    return {
      labels: ['Taken', 'Missed', 'Skipped'],
      datasets: [
        {
          data: [takenCount, missedCount, skippedCount],
          backgroundColor: ['#16a34a', '#dc2626', '#f59e0b'],
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#6b7280'
      }}>
        Loading charts...
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Time Range Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          📊 Health Analytics {userId && '(Patient View)'}
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['7', '30', '90'].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: timeRange === days ? '#059669' : '#f3f4f6',
                color: timeRange === days ? 'white' : '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Blood Pressure & Heart Rate */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            💓 Blood Pressure & Heart Rate Trends
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={prepareVitalsChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Blood Sugar */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            🍯 Blood Sugar Levels
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={prepareBloodSugarChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Weight Tracking */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            ⚖️ Weight Progress
          </h3>
          <div style={{ height: '300px' }}>
            <Bar data={prepareWeightChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Medication Compliance */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            💊 Medication Compliance
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={prepareMedicationComplianceData()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Health Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {vitalsData.length > 0 && (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💓</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {vitalsData[0]?.bloodPressure?.systolic || '--'}/{vitalsData[0]?.bloodPressure?.diastolic || '--'}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Latest Blood Pressure</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {vitalsData[0]?.heartRate || '--'} bpm
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Latest Heart Rate</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍯</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {vitalsData[0]?.bloodSugar || '--'} mg/dL
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Latest Blood Sugar</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚖️</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {vitalsData[0]?.weight || '--'} kg
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Latest Weight</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
