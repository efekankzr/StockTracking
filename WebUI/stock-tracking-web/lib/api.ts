import axios from 'axios';
import Cookies from 'js-cookie';

// const BASE_URL = 'http://localhost:7171/api'; 
const BASE_URL = 'http://localhost:5051/api';
// const BASE_URL = 'http://56.228.26.46/api'; 


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Oturum süresi dolmuş.");

      Cookies.remove('token', { path: '/' });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;