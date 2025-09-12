import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data?.data?.requiresVerification) {
        navigate('/verify-otp', { state: { email } });
      } else {
        const token = data?.data?.token;
        const user = data?.data?.user;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/dashboard');
        } else {
          setError('Unexpected response');
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
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
      padding: '3rem 1rem',
      fontFamily: 'Poppins, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '450px',
        width: '100%',
        padding: '3rem',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            🏥
          </div>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 0.8rem 0',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Sign in to your Healthcare+ account
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
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.8rem',
              color: '#1f2937',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Email Address
            </label>
            <input
              type="email"
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1.1rem',
                background: 'white',
                boxSizing: 'border-box',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease'
              }}
              placeholder="Enter your email address"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{marginBottom: '2rem'}}>
            <label style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.8rem',
              color: '#1f2937',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Password
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                padding: '1.2rem 1.5rem',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1.1rem',
                background: 'white',
                boxSizing: 'border-box',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.3s ease'
              }}
              placeholder="Enter your password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              padding: '1.2rem 2rem',
              borderRadius: '16px',
              border: 'none',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              transition: 'all 0.3s ease',
              fontFamily: 'Poppins, sans-serif',
              boxShadow: loading ? 'none' : '0 8px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #047857 0%, #059669 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 20px -3px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {loading ? '🔄 Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        {/* Demo Account Section */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '2rem',
          borderRadius: '20px',
          marginTop: '2rem',
          border: '2px solid #bbf7d0',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 1rem 0',
            fontFamily: 'Poppins, sans-serif'
          }}>
            🚀 Quick Demo Access
          </h3>
          <p style={{
            color: '#6b7280',
            margin: '0 0 1.5rem 0',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            Try Healthcare+ instantly with our demo account
          </p>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px solid #bbf7d0',
            fontSize: '1rem',
            color: '#374151',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>📧 Email:</strong> demo@healthcare.com
            </div>
            <div>
              <strong>🔑 Password:</strong> demo123
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Don't have an account?
          </p>
          <Link
            to="/signup"
            style={{
              color: '#059669',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1.2rem',
              fontFamily: 'Poppins, sans-serif',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f0fdf4';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Create Account →
          </Link>
        </div>
      </div>
    </div>
  );
}

