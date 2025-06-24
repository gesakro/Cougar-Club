import axios from 'axios';

// Detectar si estamos en desarrollo local
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Usar localhost para desarrollo local, o la variable de entorno para producción
const API_BASE_URL = isLocalDevelopment 
  ? 'http://localhost:5000' 
  : (process.env.VUE_APP_API_URL || 'http://localhost:5000');

console.log('API Base URL:', API_BASE_URL); // Para debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Si usas cookies
  timeout: 12000,
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);

export default api; 