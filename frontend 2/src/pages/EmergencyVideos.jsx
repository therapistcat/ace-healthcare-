import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

export default function EmergencyVideos() {
  const { i18n, t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/emergency/videos');
        setVideos(data?.data?.videos || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sendAlert = async () => {
    try {
      await api.post('/emergency/alert');
      alert('Emergency alert sent');
    } catch (e) {
      alert('Failed to send alert');
    }
  };

  return (
    <div className="container-px py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{t('emergencyVideos')}</h2>
        <button onClick={sendAlert} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm">{t('sendEmergencyAlert')}</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => (
            <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="p-4 border rounded hover:shadow">
              <div className="text-lg font-medium mb-1">{v.title?.[i18n.language] || v.title?.en}</div>
              <div className="text-xs text-gray-500">Category: {v.category}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

