import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasVisitedDashboard');
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '5rem'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          textDecoration: 'none',
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: '1.8rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            🏥
          </div>
          <div>
            <div style={{
              fontWeight: '800',
              fontSize: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              Healthcare+
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {t('tagline') || 'Your Digital Health Companion'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: window.innerWidth > 768 ? 'flex' : 'none',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {user && (
            <>
              <Link
                to="/dashboard"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#f0fdf4';
                  e.target.style.color = '#059669';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                }}
              >
                📊 {t('dashboard') || 'Dashboard'}
              </Link>

              <Link
                to="/videos"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#fef3c7';
                  e.target.style.color = '#d97706';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#374151';
                }}
              >
                🚨 {t('emergency') || 'Emergency'}
              </Link>
            </>
          )}

          <LanguageSwitcher />

          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {user.role || 'Patient'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                🚪 {t('logout') || 'Logout'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Link
                to="/login"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#059669',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: '2px solid #059669',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#059669';
                }}
              >
                {t('login') || 'Login'}
              </Link>

              <Link
                to="/signup"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                {t('signup') || 'Sign Up'}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: window.innerWidth <= 768 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3rem',
            height: '3rem',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          display: window.innerWidth <= 768 ? 'block' : 'none',
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem'
        }}>
          {user && (
            <>
              <Link
                to="/dashboard"
                style={{
                  display: 'block',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📊 {t('dashboard') || 'Dashboard'}
              </Link>

              <Link
                to="/videos"
                style={{
                  display: 'block',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🚨 {t('emergency') || 'Emergency'}
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                🚪 {t('logout') || 'Logout'}
              </button>
            </>
          )}

          {!user && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <Link
                to="/login"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#059669',
                  textDecoration: 'none',
                  border: '2px solid #059669',
                  borderRadius: '8px'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('login') || 'Login'}
              </Link>

              <Link
                to="/signup"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'white',
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '8px'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('signup') || 'Sign Up'}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
