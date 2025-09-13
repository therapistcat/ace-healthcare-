import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        padding: isMobile ? '0 1rem' : '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? '4rem' : '5rem'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.5rem' : '1rem',
          textDecoration: 'none',
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: isMobile ? '2.5rem' : '3.5rem',
            height: isMobile ? '2.5rem' : '3.5rem',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '800',
            fontSize: isMobile ? '1.2rem' : '1.8rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'/%3E%3C/svg%3E"
              alt="Healthcare"
              style={{ width: isMobile ? '1.2rem' : '1.8rem', height: isMobile ? '1.2rem' : '1.8rem' }}
            />
          </div>
          {!isMobile && (
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
                {t('tagline') || 'आपका डिजिटल स्वास्थ्य साथी'}
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: !isMobile ? 'flex' : 'none',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {user && (
            <>
              <Link
                to="/dashboard"
                style={{
                  fontSize: '1rem',
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
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/%3E%3C/svg%3E"
                  alt="Dashboard"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('dashboard') || 'Dashboard'}
              </Link>

              <Link
                to="/videos"
                style={{
                  fontSize: '1rem',
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
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'/%3E%3C/svg%3E"
                  alt="Emergency"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('emergency') || 'Emergency'}
              </Link>
            </>
          )}



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
                  width: '2rem',
                  height: '2rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {user.role === 'patient' ? 'मरीज़' :
                     user.role === 'doctor' ? 'डॉक्टर' :
                     user.role === 'family' ? 'परिवार' :
                     user.role === 'caregiver' ? 'देखभालकर्ता' : user.role || 'मरीज़'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
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
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'/%3E%3C/svg%3E"
                  alt="Logout"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('logout') || 'लॉगआउट'}
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
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#e5e7eb';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#f3f4f6';
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          display: isMobile ? 'block' : 'none',
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {user && (
            <>
              {/* User Info in Mobile */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '1rem',
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
                    {user.role === 'patient' ? 'मरीज़' :
                     user.role === 'doctor' ? 'डॉक्टर' :
                     user.role === 'family' ? 'परिवार' :
                     user.role === 'caregiver' ? 'देखभालकर्ता' : user.role || 'मरीज़'}
                  </div>
                </div>
              </div>

              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  transition: 'background 0.3s ease'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseOver={(e) => e.target.style.background = '#f0fdf4'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/%3E%3C/svg%3E"
                  alt="Dashboard"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                {t('dashboard') || 'Dashboard'}
              </Link>

              <Link
                to="/videos"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#374151',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  transition: 'background 0.3s ease'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseOver={(e) => e.target.style.background = '#fef3c7'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'/%3E%3C/svg%3E"
                  alt="Emergency"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                {t('emergency') || 'Emergency'}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'/%3E%3C/svg%3E"
                  alt="Logout"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                {t('logout') || 'लॉगआउट'}
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
