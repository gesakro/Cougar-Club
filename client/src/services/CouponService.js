import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
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
  // Validar un cupón
  async validateCoupon(code) {
    const response = await apiClient.get(`/coupons/validate/${code}`);
    return response.data;
  },

  // Obtener cupones del usuario
  async getUserCoupons() {
    const response = await apiClient.get('/coupons/user');
    return response.data;
  },

  // Aplicar un cupón a una compra
  async applyCoupon(code, purchaseData) {
    const response = await apiClient.post('/coupons/apply', {
      code,
      purchaseData
    });
    return response.data;
  }
}; 