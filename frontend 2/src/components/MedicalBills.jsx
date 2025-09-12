import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import ImageRecognition from './ImageRecognition';

export default function MedicalBills() {
  const { t } = useTranslation();
  const [bills, setBills] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBill, setNewBill] = useState({
    provider: '',
    amount: '',
    date: '',
    description: '',
    category: 'consultation',
    status: 'pending'
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/health/medical-bills');
      setBills(data?.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      // Mock data for demo
      setBills([
        {
          _id: '1',
          provider: 'City General Hospital',
          amount: '$250.00',
          date: '2024-01-15',
          description: 'Annual Physical Examination',
          category: 'consultation',
          status: 'paid',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          provider: 'MediLab Diagnostics',
          amount: '$85.00',
          date: '2024-01-10',
          description: 'Blood Test - Complete Panel',
          category: 'lab',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/health/medical-bills', newBill);
      if (data.success) {
        setBills(prev => [data.data, ...prev]);
        setNewBill({
          provider: '',
          amount: '',
          date: '',
          description: '',
          category: 'consultation',
          status: 'pending'
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding bill:', error);
      // Add to local state for demo
      const mockBill = {
        _id: Date.now().toString(),
        ...newBill,
        createdAt: new Date().toISOString()
      };
      setBills(prev => [mockBill, ...prev]);
      setNewBill({
        provider: '',
        amount: '',
        date: '',
        description: '',
        category: 'consultation',
        status: 'pending'
      });
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRecognitionResult = (result) => {
    const { processedData } = result;
    setNewBill(prev => ({
      ...prev,
      provider: processedData.provider || prev.provider,
      amount: processedData.amount || prev.amount,
      date: processedData.date || prev.date,
      description: processedData.allText?.substring(0, 100) || prev.description
    }));
    setShowAddForm(true);
    setShowImageRecognition(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'overdue': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'consultation': return '👨‍⚕️';
      case 'lab': return '🧪';
      case 'pharmacy': return '💊';
      case 'imaging': return '📷';
      case 'surgery': return '🏥';
      case 'emergency': return '🚨';
      default: return '📄';
    }
  };

  const getTotalAmount = () => {
    return bills.reduce((total, bill) => {
      const amount = parseFloat(bill.amount.replace(/[^0-9.]/g, '')) || 0;
      return total + amount;
    }, 0);
  };

  const getPendingAmount = () => {
    return bills
      .filter(bill => bill.status === 'pending' || bill.status === 'overdue')
      .reduce((total, bill) => {
        const amount = parseFloat(bill.amount.replace(/[^0-9.]/g, '')) || 0;
        return total + amount;
      }, 0);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${getTotalAmount().toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Medical Expenses</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            ${getPendingAmount().toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pending Payments</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {bills.length}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Bills</div>
        </div>
      </div>

      {/* Bills List */}
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
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🧾 Medical Bills
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
              + Add Bill
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
              📷 Scan Bill
            </button>
          </div>
        </div>

        {bills.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧾</div>
            <p>No medical bills added yet.</p>
            <p>Start by adding your first bill or scanning one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {bills.map(bill => (
              <div key={bill._id} style={{
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
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getCategoryIcon(bill.category)}
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {bill.provider}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.875rem'
                    }}>
                      {bill.description}
                    </p>
                    <p style={{
                      color: '#6b7280',
                      margin: 0,
                      fontSize: '0.75rem'
                    }}>
                      Date: {new Date(bill.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {bill.amount}
                  </div>
                  
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    background: getStatusColor(bill.status) + '20',
                    color: getStatusColor(bill.status),
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}>
                    {bill.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
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
              Add New Medical Bill
            </h3>

            <form onSubmit={addBill}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Healthcare Provider
                </label>
                <input
                  type="text"
                  value={newBill.provider}
                  onChange={(e) => setNewBill(prev => ({ ...prev, provider: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., City General Hospital"
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
                    Amount
                  </label>
                  <input
                    type="text"
                    value={newBill.amount}
                    onChange={(e) => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="$0.00"
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newBill.date}
                    onChange={(e) => setNewBill(prev => ({ ...prev, date: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  value={newBill.description}
                  onChange={(e) => setNewBill(prev => ({ ...prev, description: e.target.value }))}
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
                  placeholder="Brief description of the service"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category
                  </label>
                  <select
                    value={newBill.category}
                    onChange={(e) => setNewBill(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="consultation">Consultation</option>
                    <option value="lab">Lab Tests</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="imaging">Imaging</option>
                    <option value="surgery">Surgery</option>
                    <option value="emergency">Emergency</option>
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
                    Status
                  </label>
                  <select
                    value={newBill.status}
                    onChange={(e) => setNewBill(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
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
                  {loading ? 'Adding...' : 'Add Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Recognition Modal */}
      {showImageRecognition && (
        <ImageRecognition
          type="bill"
          onResult={handleImageRecognitionResult}
          onClose={() => setShowImageRecognition(false)}
        />
      )}
    </div>
  );
}
