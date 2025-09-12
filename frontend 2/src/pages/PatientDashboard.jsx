import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import api from '../api/client';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const boxRef = useRef();
  useEffect(() => { gsap.from(boxRef.current, { y: 20, opacity: 0, duration: 0.6 }); }, []);

  const sendAlert = async () => {
    await api.post('/emergency/alert');
    alert('Emergency alert sent');
  };

  return (
    <div className="container-px py-8">
      <div ref={boxRef} className="p-6 rounded-lg bg-blue-50 border">
        <h2 className="text-xl font-semibold mb-2">Patient Dashboard</h2>
        <p className="text-sm mb-4">Quickly access vitals, reports and alerts.</p>
        <button onClick={sendAlert} className="bg-red-600 text-white px-4 py-2 rounded">{t('sendEmergencyAlert')}</button>
      </div>
    </div>
  );
}

