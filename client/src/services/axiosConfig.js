import axios from 'axios';
import router from '@/router';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Error en la respuesta:', error);
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      switch (error.response.status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userCompany');
          router.push('/login?expired=true');
          break;
        case 403:
          // Acceso prohibido
          router.push('/unauthorized');
          break;
        case 404:
          // Recurso no encontrado
          console.error('Recurso no encontrado:', error.response.data);
          break;
        case 500:
          // Error del servidor
          console.error('Error del servidor:', error.response.data);
          break;
        default:
          console.error('Error no manejado:', error.response.data);
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo ocurrió al configurar la petición
      console.error('Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 