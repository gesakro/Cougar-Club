import axios from 'axios';
import router from '@/router'; // Ajusta la ruta a donde esté definida la instancia de tu router

const API_URL = 'http://localhost:5000/api/auth';

// Función auxiliar para decodificar el token JWT
const decodeToken = (token) => {
  try {
    const tokenParts = token.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

// Configurar interceptores de axios para agregar el token automáticamente
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de respuesta para manejar errores de autenticación
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Si el token expiró o es inválido, cerrar sesión y redirigir al login
      AuthService.logout();
      router.push('/login?expired=true');
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  // Iniciar sesión
  async login(credentials) {
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data.token) {
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Decodificar el token para extraer la información del usuario
      const decodedToken = decodeToken(response.data.token);
      
      if (decodedToken && decodedToken.user) {
        // Extraer la información del usuario desde el token decodificado
        const { id, email, rol, compania_id } = decodedToken.user;
        
        // Guardar información en localStorage
        localStorage.setItem('userId', id);
        localStorage.setItem('userEmail', email || credentials.email);
        localStorage.setItem('userRole', rol || 'Usuario');
        
        // Si el usuario es Gerente, almacenar también su compania_id
        if (rol === 'Gerente' && compania_id) {
          localStorage.setItem('userCompany', compania_id);
        } else {
          localStorage.removeItem('userCompany');
        }
        
        // Obtener más datos del perfil del usuario (opcional)
        try {
          const userProfile = await this.getCurrentUser();
          if (userProfile && userProfile.perfil && userProfile.perfil.nombre) {
            localStorage.setItem('userName', userProfile.perfil.nombre);
          } else {
            localStorage.setItem('userName', 'Usuario');
          }
        } catch (error) {
          console.error('Error al obtener perfil del usuario:', error);
          localStorage.setItem('userName', 'Usuario');
        }
      }
    }
    
    return response.data;
  },
  
  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userCompany');
  },
  
  // Registrar un nuevo usuario
  async register(userData) {
    return await axios.post(`${API_URL}/register`, userData);
  },
  
  // Obtener el usuario actual desde el token
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await axios.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  },
  
  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  // Obtener el rol del usuario
  getUserRole() {
    return localStorage.getItem('userRole') || '';
  },
  
  // Obtener el nombre del usuario
  getUserName() {
    return localStorage.getItem('userName') || 'Usuario';
  },
  
  // Obtener el email del usuario
  getUserEmail() {
    return localStorage.getItem('userEmail') || '';
  },
  
  // Obtener el ID de compañía (para usuario Gerente)
  getUserCompany() {
    return localStorage.getItem('userCompany') || '';
  }
};

export default AuthService;