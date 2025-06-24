import axios from 'axios';

// Detectar si estamos en desarrollo local
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Usar localhost para desarrollo local, o la variable de entorno para producción
const API_BASE_URL = isLocalDevelopment 
  ? 'http://localhost:5000' 
  : (process.env.VUE_APP_API_URL || 'http://localhost:5000');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // Validar un cupón (con autenticación para validaciones completas)
  async validateCoupon(code) {
    const response = await apiClient.get(`/api/coupons/validate/${code}`);
    return response.data;
  },

  // Obtener cupones del usuario
  async getUserCoupons() {
    const response = await apiClient.get('/api/coupons/user');
    return response.data;
  },

  // Aplicar un cupón a una compra
  async applyCoupon(code, purchaseData) {
    const response = await apiClient.post('/api/coupons/apply', {
      code,
      purchaseData
    });
    return response.data;
  }
}; 