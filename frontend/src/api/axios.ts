import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use(
  (config) => {
  
    const token = localStorage.getItem('access_token');
    
    const authPaths = ['/auth/login/', '/auth/register/'];
    const isAuthPath = authPaths.some(path => config.url?.includes(path));

    if (token && !isAuthPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    
    if (error.response && error.response.status === 401) {
      if (requestUrl.includes('/auth/login/')) {
        return Promise.reject(error);
      }

      
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;