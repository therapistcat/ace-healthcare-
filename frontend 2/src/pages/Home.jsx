import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';

export default function Home() {
  const { t } = useTranslation();
  const heroRef = useRef();
  const featuresRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    gsap.from(heroRef.current, { y: 30, opacity: 0, duration: 1, ease: 'power2.out' });
    gsap.from(featuresRef.current?.children || [], {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      delay: 0.3,
      ease: 'power2.out'
    });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // If user is logged in, show a different home experience
  if (user) {
    return (
      <div style={{
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)'
      }}>
        {/* Welcome Back Section */}
        <section style={{
          padding: isMobile ? '3rem 1rem' : '4rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: isMobile ? '2rem 1.5rem' : '3rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{
                width: isMobile ? '4rem' : '5rem',
                height: isMobile ? '4rem' : '5rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: isMobile ? '2rem' : '2.5rem',
                color: 'white',
                fontWeight: '800'
              }}>
                👋
              </div>

              <h1 style={{
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                fontWeight: '800',
                color: '#1f2937',
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                {t('welcomeBack') || 'स्वागत है'}, {user.name}!
              </h1>

              <p style={{
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                color: '#6b7280',
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                {t('readyToManageHealth') || 'आज अपने स्वास्थ्य का ख्याल रखने के लिए तैयार हैं?'}
              </p>

              <Link
                to="/dashboard"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  padding: isMobile ? '1rem 2rem' : '1.2rem 3rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  fontWeight: '700',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 25px -3px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/%3E%3C/svg%3E"
                  alt="Dashboard"
                  style={{ width: '1.5rem', height: '1.5rem' }}
                />
                {t('goToDashboard') || 'डैशबोर्ड पर जाएं'}
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{
          padding: isMobile ? '2rem 1rem' : '3rem 2rem'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              {t('quickActions') || 'त्वरित कार्य'}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Quick Action Cards */}
              <Link
                to="/dashboard"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#059669';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'/%3E%3C/svg%3E"
                    alt="Health"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {t('trackVitals') || 'वाइटल्स ट्रैक करें'}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {t('trackVitalsDesc') || 'अपने रक्तचाप, हृदय गति और अन्य महत्वपूर्ण संकेतकों को ट्रैक करें'}
                </p>
              </Link>

              <Link
                to="/dashboard"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#d97706';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z'/%3E%3C/svg%3E"
                    alt="Medication"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {t('manageMedications') || 'दवाइयां प्रबंधित करें'}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {t('manageMedicationsDesc') || 'अपनी दवाओं का समय और खुराक ट्रैक करें'}
                </p>
              </Link>

              <Link
                to="/videos"
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'/%3E%3C/svg%3E"
                    alt="Emergency"
                    style={{ width: '1.5rem', height: '1.5rem' }}
                  />
                </div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {t('emergencyHelp') || 'आपातकालीन सहायता'}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {t('emergencyHelpDesc') || 'आपातकालीन स्थितियों के लिए तुरंत सहायता और वीडियो गाइड'}
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // For non-logged in users, show the marketing page
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #ffffff 100%)',
        padding: isMobile ? '3rem 1rem' : '4rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          <div ref={heroRef} style={{
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Logo */}
            <div style={{
              width: isMobile ? '4rem' : '5rem',
              height: isMobile ? '4rem' : '5rem',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: isMobile ? '2rem' : '2.5rem',
              color: 'white',
              fontWeight: '800',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'/%3E%3C/svg%3E"
                alt="Healthcare"
                style={{ width: isMobile ? '2rem' : '2.5rem', height: isMobile ? '2rem' : '2.5rem' }}
              />
            </div>

            {/* Main Heading */}
            <h1 style={{
              fontSize: isMobile ? '2rem' : '3.5rem',
              fontWeight: '900',
              marginBottom: '1.5rem',
              color: '#1f2937',
              lineHeight: '1.2'
            }}>
              {t('heroTitle') || 'आपका संपूर्ण डिजिटल'}
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {t('heroTitleHighlight') || 'स्वास्थ्य साथी'}
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: isMobile ? '1.1rem' : '1.4rem',
              color: '#6b7280',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
              fontWeight: '400',
              maxWidth: '600px',
              margin: '0 auto 2.5rem'
            }}>
              {t('heroSubtitle') || 'वाइटल्स ट्रैक करें, दवाइयां प्रबंधित करें, परिवार से जुड़ें, और AI-संचालित स्वास्थ्य अंतर्दृष्टि प्राप्त करें - सभी एक सुरक्षित प्लेटफॉर्म में।'}
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '1rem' : '1.5rem',
              justifyContent: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              marginBottom: '2.5rem'
            }}>
              <Link
                to="/signup"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  padding: isMobile ? '1rem 2rem' : '1.2rem 3rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: isMobile ? '1.1rem' : '1.2rem',
                  fontWeight: '700',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '300px' : 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 25px -3px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E"
                  alt="Start"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                {t('getStarted') || 'मुफ्त में शुरू करें'}
              </Link>

              <Link
                to="/login"
                style={{
                  background: 'white',
                  color: '#059669',
                  padding: isMobile ? '1rem 2rem' : '1.2rem 3rem',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: isMobile ? '1.1rem' : '1.2rem',
                  fontWeight: '700',
                  border: '2px solid #059669',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '300px' : 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#059669';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'/%3E%3C/svg%3E"
                  alt="Login"
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                {t('signIn') || 'साइन इन करें'}
              </Link>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '1rem' : '2rem',
              flexWrap: 'wrap',
              opacity: 0.9
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: '#6b7280',
                background: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23059669'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'/%3E%3C/svg%3E"
                  alt="Secure"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('secureData') || 'सुरक्षित और निजी'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: '#6b7280',
                background: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23059669'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'/%3E%3C/svg%3E"
                  alt="AI"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('aiPowered') || 'AI-संचालित'}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                color: '#6b7280',
                background: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23059669'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'/%3E%3C/svg%3E"
                  alt="Family"
                  style={{ width: '1rem', height: '1rem' }}
                />
                {t('familyFriendly') || 'पारिवारिक-अनुकूल'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: isMobile ? '3rem 1rem' : '4rem 2rem',
        background: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: isMobile ? '2.5rem' : '3rem'
          }}>
            <h2 style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              {t('featuresTitle') || 'बेहतर स्वास्थ्य के लिए सब कुछ'}
            </h2>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.2rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {t('featuresSubtitle') || 'रोगियों, परिवारों और स्वास्थ्य सेवा प्रदाताओं के लिए डिज़ाइन किए गए व्यापक स्वास्थ्य प्रबंधन उपकरण।'}
            </p>
          </div>

          <div ref={featuresRef} style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
            marginBottom: isMobile ? '2.5rem' : '3rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              padding: isMobile ? '2rem' : '2.5rem',
              borderRadius: '20px',
              border: '2px solid #bbf7d0',
              transition: 'transform 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/%3E%3C/svg%3E"
                  alt="Health Tracking"
                  style={{ width: '2rem', height: '2rem' }}
                />
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                {t('feature1Title') || 'स्वास्थ्य ट्रैकिंग'}
              </h3>
              <p style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {t('feature1Description') || 'वाइटल साइन्स की निगरानी करें, दवाइयों को ट्रैक करें, और इंटरैक्टिव चार्ट और अंतर्दृष्टि के साथ अपने स्वास्थ्य रुझानों को देखें।'}
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: isMobile ? '2rem' : '2.5rem',
              borderRadius: '20px',
              border: '2px solid #fcd34d',
              transition: 'transform 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'/%3E%3C/svg%3E"
                  alt="Family Care"
                  style={{ width: '2rem', height: '2rem' }}
                />
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                {t('feature2Title') || 'पारिवारिक देखभाल'}
              </h3>
              <p style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {t('feature2Description') || 'परिवार के सदस्यों और देखभालकर्ताओं से जुड़ें। स्वास्थ्य डेटा सुरक्षित रूप से साझा करें और दवा अनुस्मारक के लिए अलर्ट प्राप्त करें।'}
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
              padding: isMobile ? '2rem' : '2.5rem',
              borderRadius: '20px',
              border: '2px solid #81d4fa',
              transition: 'transform 0.3s ease',
              textAlign: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '4rem',
                height: '4rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <img
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'/%3E%3C/svg%3E"
                  alt="AI Assistant"
                  style={{ width: '2rem', height: '2rem' }}
                />
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.2rem' : '1.4rem',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                {t('feature3Title') || 'AI सहायक'}
              </h3>
              <p style={{
                fontSize: isMobile ? '1rem' : '1.1rem',
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {t('feature3Description') || 'हमारे AI-संचालित सहायक से तुरंत स्वास्थ्य सलाह, दवा अनुस्मारक, और व्यक्तिगत कल्याण सुझाव प्राप्त करें।'}
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: isMobile ? '2.5rem 1.5rem' : '3rem 2rem',
            borderRadius: '20px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '800',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              {t('ctaTitle') || 'अपनी स्वास्थ्य यात्रा को बदलने के लिए तैयार हैं?'}
            </h3>
            <p style={{
              fontSize: isMobile ? '1rem' : '1.1rem',
              color: '#6b7280',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem',
              lineHeight: '1.6'
            }}>
              {t('ctaDescription') || 'हजारों परिवारों के साथ जुड़ें जो पहले से ही Healthcare+ का उपयोग करके अपने स्वास्थ्य का बेहतर प्रबंधन कर रहे हैं।'}
            </p>
            <Link
              to="/signup"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                padding: isMobile ? '1rem 2rem' : '1.2rem 3rem',
                borderRadius: '16px',
                textDecoration: 'none',
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                fontWeight: '700',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 25px -3px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E"
                alt="Start"
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
              {t('startToday') || 'आज ही अपनी स्वास्थ्य यात्रा शुरू करें'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
