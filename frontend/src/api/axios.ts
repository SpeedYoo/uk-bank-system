import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  
  const isAuthPath = config.url?.includes('/auth/login/') || config.url?.includes('/auth/register/');
  
  if (token && !isAuthPath) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;