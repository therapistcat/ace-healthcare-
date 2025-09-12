import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const change = (lng) => i18n.changeLanguage(lng);

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'inline-flex'
    }}>
      <button
        onClick={() => change('en')}
        style={{
          padding: '0.5rem 1rem',
          border: 'none',
          background: i18n.language === 'en' ? '#059669' : 'transparent',
          color: i18n.language === 'en' ? 'white' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
        onMouseOver={(e) => {
          if (i18n.language !== 'en') {
            e.target.style.background = '#d1fae5';
            e.target.style.color = '#059669';
          }
        }}
        onMouseOut={(e) => {
          if (i18n.language !== 'en') {
            e.target.style.background = 'transparent';
            e.target.style.color = '#6b7280';
          }
        }}
      >
        EN
      </button>
      <button
        onClick={() => change('hi')}
        style={{
          padding: '0.5rem 1rem',
          border: 'none',
          background: i18n.language === 'hi' ? '#059669' : 'transparent',
          color: i18n.language === 'hi' ? 'white' : '#6b7280',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          fontSize: '0.875rem'
        }}
        onMouseOver={(e) => {
          if (i18n.language !== 'hi') {
            e.target.style.background = '#d1fae5';
            e.target.style.color = '#059669';
          }
        }}
        onMouseOut={(e) => {
          if (i18n.language !== 'hi') {
            e.target.style.background = 'transparent';
            e.target.style.color = '#6b7280';
          }
        }}
      >
        हि
      </button>
    </div>
  );
}

