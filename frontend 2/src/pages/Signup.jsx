import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('Submitting signup form:', form);
      const { data } = await api.post('/auth/signup', form);
      console.log('Signup response:', data);
      if (data?.data?.requiresVerification || data?.success) {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err?.response?.data?.message || err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        padding: '2rem'
      }}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem',
            color: '#059669',
            fontWeight: 'bold'
          }}>
            +
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0'}}>
            {t('signup')}
          </h1>
          <p style={{color: '#6b7280', margin: 0}}>
            Join our healthcare platform
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              {t('name')}
            </label>
            <input
              name="name"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your full name"
              value={form.name}
              onChange={onChange}
              required
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              {t('email')}
            </label>
            <input
              name="email"
              type="email"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email address"
              value={form.email}
              onChange={onChange}
              required
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              {t('phone')}
            </label>
            <input
              name="phone"
              type="tel"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your phone number"
              value={form.phone}
              onChange={onChange}
              required
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              {t('password')}
            </label>
            <input
              name="password"
              type="password"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box'
              }}
              placeholder="Create a secure password"
              value={form.password}
              onChange={onChange}
              required
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              {t('role')}
            </label>
            <select
              name="role"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box'
              }}
              value={form.role}
              onChange={onChange}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="patient">{t('patient')}</option>
              <option value="family">{t('family')}</option>
              <option value="caregiver">{t('caregiver')}</option>
              <option value="doctor">{t('doctor')}</option>
            </select>
          </div>

          <button
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.background = 'linear-gradient(135deg, #047857 0%, #059669 100%)';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            }}
          >
            {loading ? 'Creating account...' : t('signup')}
          </button>
        </form>

        <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
          <p style={{fontSize: '0.875rem', color: '#6b7280', margin: 0}}>
            Already have an account?{' '}
            <Link to="/login" style={{fontWeight: '500', color: '#059669', textDecoration: 'none'}}>
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

