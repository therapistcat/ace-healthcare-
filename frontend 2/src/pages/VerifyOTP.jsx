import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function VerifyOTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultEmail = location?.state?.email || '';

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Sending OTP verification:', { email, otp });
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      console.log('OTP verification response:', data);

      const token = data?.data?.token;
      const user = data?.data?.user;
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('Invalid response');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err?.response?.data?.message || err?.message || 'Verification failed');
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
            ✓
          </div>
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0'}}>
            {t('verifyOtp')}
          </h1>
          <p style={{color: '#6b7280', margin: 0}}>
            We've sent a verification code to your email
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
              {t('email')}
            </label>
            <input
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
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
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
              {t('otp')}
            </label>
            <input
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '0.5rem'
              }}
              placeholder="Enter 6-digit verification code"
              value={otp}
              onChange={(e)=>setOtp(e.target.value)}
              maxLength="6"
              required
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
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
            {loading ? 'Verifying...' : t('verifyOtp')}
          </button>
        </form>

        <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{fontSize: '0.875rem', color: '#16a34a', margin: '0 0 0.5rem 0', fontWeight: '600'}}>
              🔓 Demo OTP
            </p>
            <p style={{fontSize: '0.75rem', color: '#16a34a', margin: 0}}>
              Use <strong>123456</strong> to bypass OTP verification<br/>
              Or check the backend console for the real OTP
            </p>
          </div>

          <p style={{fontSize: '0.875rem', color: '#6b7280', margin: 0}}>
            Didn't receive the code?{' '}
            <button
              style={{
                background: 'none',
                border: 'none',
                fontWeight: '500',
                color: '#059669',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

