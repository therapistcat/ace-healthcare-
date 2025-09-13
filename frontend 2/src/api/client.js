import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('API Base URL:', baseURL);
console.log('Environment variables:', import.meta.env);

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  console.log('Making API request:', config.method?.toUpperCase(), config.url, config.data);
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

