<template>
  <div class="user-profile-view">
    <AppNavbar />

    <main class="profile-container">
      <div class="breadcrumb">
        <button @click="goBack" class="breadcrumb-link">
          <i class="fas fa-arrow-left"></i> Volver
        </button>
        <h1 class="page-title">Mi Perfil</h1>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="error" class="error-message">
        <div class="placeholder-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error al cargar el perfil</h3>
        <p>{{ error }}</p>
        <button @click="fetchUserProfile" class="return-btn">Intentar nuevamente</button>
      </div>

      <div v-else class="profile-content">
        <!-- SECCIÓN DE INFORMACIÓN PERSONAL -->
        <div class="profile-section">
          <div class="section-header">
            <h2><i class="fas fa-user"></i> Información Personal</h2>
            <button @click="toggleEditMode" class="edit-btn">
              <i class="fas fa-edit"></i> {{ editMode ? 'Cancelar' : 'Editar' }}
            </button>
          </div>

          <div class="profile-card">
            <div class="profile-avatar">
              <div class="avatar-circle">
                <i class="fas fa-user-circle"></i>
              </div>
            </div>

            <div class="profile-info">
              <div class="info-grid">
                <div class="info-item">
                  <label>Nombre completo:</label>
                  <input 
                    v-if="editMode" 
                    v-model="editableUser.nombre" 
                    type="text" 
                    class="edit-input"
                  />
                  <span v-else>{{ user.nombre || 'No especificado' }}</span>
                </div>

                <div class="info-item">
                  <label>Email:</label>
                  <input 
                    v-if="editMode" 
                    v-model="editableUser.email" 
                    type="email" 
                    class="edit-input"
                  />
                  <span v-else>{{ user.email || 'No especificado' }}</span>
                </div>

                <div class="info-item">
                  <label>Teléfono:</label>
                  <input 
                    v-if="editMode" 
                    v-model="editableUser.telefono" 
                    type="tel" 
                    class="edit-input"
                  />
                  <span v-else>{{ user.telefono || 'No especificado' }}</span>
                </div>

                <div class="info-item">
                  <label>Dirección:</label>
                  <textarea 
                    v-if="editMode" 
                    v-model="editableUser.direccion" 
                    class="edit-textarea"
                    rows="3"
                  ></textarea>
                  <span v-else>{{ user.direccion || 'No especificada' }}</span>
                </div>

                <div class="info-item">
                  <label>Miembro desde:</label>
                  <span>{{ formatDate(user.fechaRegistro) }}</span>
                </div>

                <div class="info-item">
                  <label>Total gastado:</label>
                  <span class="total-spent">{{ formatPrice(userStats.totalGastado) }}</span>
                </div>
              </div>

              <div v-if="editMode" class="edit-actions">
                <button @click="saveProfile" class="save-btn" :disabled="saving">
                  <span v-if="saving">Guardando...</span>
                  <span v-else><i class="fas fa-save"></i> Guardar cambios</span>
                </button>
                <button @click="cancelEdit" class="cancel-btn">Cancelar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE ESTADÍSTICAS -->
        <div class="profile-section">
          <div class="section-header">
            <h2><i class="fas fa-chart-bar"></i> Estadísticas de Compras</h2>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.totalCompras }}</h3>
                <p>Compras realizadas</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-euro-sign"></i>
              </div>
              <div class="stat-info">
                <h3>{{ formatPrice(userStats.totalGastado) }}</h3>
                <p>Total gastado</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-gift"></i>
              </div>
              <div class="stat-info">
                <h3>{{ availableCoupons.length }}</h3>
                <p>Cupones disponibles</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getUserLevel() }}</h3>
                <p>Nivel de usuario</p>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN DE CUPONES -->
        <div class="profile-section">
          <div class="section-header">
            <h2><i class="fas fa-ticket-alt"></i> Mis Cupones</h2>
            <div class="progress-info">
              <span>Progreso hacia el próximo cupón: {{ formatPrice(userStats.totalGastado) }} / {{ formatPrice(getNextCouponThreshold()) }}</span>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
            </div>
            <div class="progress-text">
              {{ getProgressPercentage().toFixed(0) }}% completado
            </div>
          </div>

          <!-- Cupones disponibles -->
          <div v-if="availableCoupons.length > 0" class="coupons-section">
            <h3>Cupones Disponibles</h3>
            <div class="coupons-grid">
              <div 
                v-for="coupon in availableCoupons" 
                :key="coupon.id" 
                class="coupon-card available"
              >
                <div class="coupon-header">
                  <div class="coupon-discount">{{ coupon.descuento }}% OFF</div>
                  <div class="coupon-status">
                    <i class="fas fa-check-circle"></i> Disponible
                  </div>
                </div>
                <div class="coupon-body">
                  <h4>{{ coupon.nombre }}</h4>
                  <p>{{ coupon.descripcion }}</p>
                  <div class="coupon-details">
                    <span class="coupon-code">Código: {{ coupon.codigo }}</span>
                    <span class="coupon-expiry">Válido hasta: {{ formatDate(coupon.fechaExpiracion) }}</span>
                  </div>
                </div>
                <div class="coupon-actions">
                  <button @click="copyCouponCode(coupon.codigo)" class="use-coupon-btn">
                    <i class="fas fa-copy"></i> Copiar código
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Cupones bloqueados -->
          <div class="coupons-section">
            <h3>Cupones por Desbloquear</h3>
            <div class="coupons-grid">
              <div 
                v-for="coupon in lockedCoupons" 
                :key="coupon.id" 
                class="coupon-card locked"
              >
                <div class="coupon-header">
                  <div class="coupon-discount">{{ coupon.descuento }}% OFF</div>
                  <div class="coupon-status">
                    <i class="fas fa-lock"></i> Bloqueado
                  </div>
                </div>
                <div class="coupon-body">
                  <h4>{{ coupon.nombre }}</h4>
                  <p>{{ coupon.descripcion }}</p>
                  <div class="coupon-requirement">
                    <i class="fas fa-info-circle"></i>
                    Requiere: {{ formatPrice(coupon.requisitoGasto) }} en compras
                  </div>
                  <div class="coupon-progress">
                    Progreso: {{ formatPrice(userStats.totalGastado) }} / {{ formatPrice(coupon.requisitoGasto) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de confirmación para copiar código -->
    <div v-if="showCopyModal" class="modal-overlay" @click="closeCopyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>¡Código copiado!</h3>
          <button @click="closeCopyModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>El código del cupón <strong>{{ copiedCouponCode }}</strong> ha sido copiado al portapapeles.</p>
          <p>Puedes pegarlo durante el proceso de checkout para aplicar el descuento.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeCopyModal" class="confirm-btn">Entendido</button>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import axios from 'axios';

// Configuración mejorada del cliente axios
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para añadir el token a todas las peticiones
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token añadido a la petición:', config.url);
    } else {
      console.warn('⚠️ No se encontró token en localStorage');
    }
    return config;
  },
  error => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores de autenticación
apiClient.interceptors.response.use(
  response => {
    console.log('✅ Respuesta exitosa:', response.config.url);
    return response;
  },
  error => {
    console.error('❌ Error en respuesta:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      console.error('🚫 Token inválido o expirado - Limpiando localStorage');
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default {
  name: 'UserProfile',
  components: { AppNavbar, AppFooter },
  data() {
    return {
      user: {},
      userStats: {
        totalCompras: 0,
        totalGastado: 0
      },
      editableUser: {},
      loading: true,
      error: null,
      editMode: false,
      saving: false,
      showCopyModal: false,
      copiedCouponCode: '',
      availableCoupons: [],
      lockedCoupons: [
        {
          id: 1,
          nombre: 'Descuento Bronce',
          codigo: 'BRONZE10',
          descuento: 10,
          descripcion: 'Descuento del 10% en tu próxima compra',
          requisitoGasto: 500,
          fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
        },
        {
          id: 2,
          nombre: 'Descuento Plata',
          codigo: 'SILVER15',
          descuento: 15,
          descripcion: 'Descuento del 15% en tu próxima compra',
          requisitoGasto: 1000,
          fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          nombre: 'Descuento Oro',
          codigo: 'GOLD20',
          descuento: 20,
          descripcion: 'Descuento del 20% en tu próxima compra',
          requisitoGasto: 2000,
          fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          nombre: 'Descuento Platino',
          codigo: 'PLATINUM25',
          descuento: 25,
          descripcion: 'Descuento del 25% en tu próxima compra + envío gratis',
          requisitoGasto: 5000,
          fechaExpiracion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días
        }
      ]
    };
  },
  
  computed: {
    unlockedCoupons() {
      return this.lockedCoupons.filter(coupon => 
        this.userStats.totalGastado >= coupon.requisitoGasto
      );
    }
  },

  methods: {
    // Verificar autenticación antes de hacer cualquier petición
    checkAuthentication() {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('🔍 Verificando autenticación...');
      console.log('Token existe:', !!token);
      console.log('UserId existe:', !!userId);
      console.log('UserId valor:', userId);
      
      if (!token || !userId) {
        console.warn('⚠️ Usuario no autenticado - Redirigiendo al login');
        this.$router.push('/login');
        return false;
      }
      
      // Verificar si el token no ha expirado
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Token inválido');
        }
        
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        console.log('📋 Payload del token:', payload);
        console.log('⏰ Token expira en:', new Date(payload.exp * 1000));
        console.log('⏰ Tiempo actual:', new Date());
        
        if (payload.exp && payload.exp < currentTime) {
          console.warn('⚠️ Token expirado');
          this.clearAuthData();
          this.$router.push('/login');
          return false;
        }
      } catch (error) {
        console.error('❌ Error al verificar token:', error);
        this.clearAuthData();
        this.$router.push('/login');
        return false;
      }
      
      console.log('✅ Autenticación válida');
      return true;
    },

    // Limpiar datos de autenticación
    clearAuthData() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    },

    goBack() {
      window.history.length > 1 ? this.$router.back() : this.$router.push('/');
    },

    async fetchUserProfile() {
      console.log('🚀 Iniciando carga del perfil...');
      
      this.loading = true;
      this.error = null;

      // Verificar autenticación primero
      if (!this.checkAuthentication()) {
        return;
      }

      const userId = localStorage.getItem('userId');
      console.log('👤 Cargando perfil para usuario:', userId);

      try {
        // Obtener información del usuario
        console.log('📡 Haciendo petición a:', `/users/${userId}`);
        const userResponse = await apiClient.get(`/users/${userId}`);
        this.user = userResponse.data;
        console.log('✅ Usuario obtenido:', this.user);

        // Obtener estadísticas del usuario
        await this.fetchUserStats(userId);

        // Verificar cupones desbloqueados
        this.updateAvailableCoupons();

        console.log('✅ Perfil cargado completamente');

      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        
        if (error.response?.status === 401) {
          this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else if (error.response?.status === 404) {
          this.error = 'Usuario no encontrado.';
        } else if (error.code === 'ECONNABORTED') {
          this.error = 'La petición tardó demasiado. Verifica tu conexión.';
        } else {
          this.error = 'Error al cargar la información del perfil. Inténtalo nuevamente.';
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchUserStats(userId) {
      console.log('📊 Obteniendo estadísticas para usuario:', userId);
      
      try {
        const statsResponse = await apiClient.get(`/purchases/user/${userId}/stats`);
        this.userStats = statsResponse.data;
        console.log('✅ Estadísticas obtenidas:', this.userStats);
      } catch (error) {
        console.log('⚠️ Endpoint de stats no disponible, calculando desde compras...');
        
        // Si no existe el endpoint de stats, calcular desde las compras
        try {
          const purchasesResponse = await apiClient.get(`/purchases/user/${userId}`);
          const purchases = purchasesResponse.data;
          
          this.userStats = {
            totalCompras: purchases.length,
            totalGastado: purchases.reduce((sum, purchase) => 
              sum + (purchase.totalCompra || purchase.total || 0), 0)
          };
          
          console.log('✅ Estadísticas calculadas:', this.userStats);
        } catch (purchasesError) {
          console.error('❌ Error fetching user stats:', purchasesError);
          // Usar estadísticas por defecto si hay error
          this.userStats = { totalCompras: 0, totalGastado: 0 };
        }
      }
    },

    updateAvailableCoupons() {
      console.log('🎫 Actualizando cupones disponibles...');
      
      this.availableCoupons = this.lockedCoupons.filter(coupon => 
        this.userStats.totalGastado >= coupon.requisitoGasto
      );
      this.lockedCoupons = this.lockedCoupons.filter(coupon => 
        this.userStats.totalGastado < coupon.requisitoGasto
      );
      
      console.log('✅ Cupones disponibles:', this.availableCoupons.length);
      console.log('🔒 Cupones bloqueados:', this.lockedCoupons.length);
    },

    toggleEditMode() {
      if (this.editMode) {
        this.cancelEdit();
      } else {
        this.editMode = true;
        this.editableUser = { ...this.user };
      }
    },

    cancelEdit() {
      this.editMode = false;
      this.editableUser = {};
    },

    async saveProfile() {
      console.log('💾 Guardando perfil...');
      
      this.saving = true;
      try {
        const response = await apiClient.put(`/users/${this.user._id}`, this.editableUser);
        this.user = response.data;
        this.editMode = false;
        
        // Mostrar mensaje de éxito (si tienes sistema de toast)
        if (this.$toast) {
          this.$toast.success('Perfil actualizado correctamente');
        } else {
          alert('Perfil actualizado correctamente');
        }
        
        console.log('✅ Perfil guardado exitosamente');
      } catch (error) {
        console.error('❌ Error saving profile:', error);
        
        if (this.$toast) {
          this.$toast.error('Error al actualizar el perfil');
        } else {
          alert('Error al actualizar el perfil');
        }
      } finally {
        this.saving = false;
      }
    },

    async copyCouponCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.copiedCouponCode = code;
        this.showCopyModal = true;
        console.log('✅ Código copiado:', code);
      } catch (error) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.copiedCouponCode = code;
        this.showCopyModal = true;
        console.log('✅ Código copiado (fallback):', code);
      }
    },

    closeCopyModal() {
      this.showCopyModal = false;
      this.copiedCouponCode = '';
    },

    getNextCouponThreshold() {
      const nextCoupon = this.lockedCoupons.find(coupon => 
        this.userStats.totalGastado < coupon.requisitoGasto
      );
      return nextCoupon ? nextCoupon.requisitoGasto : 5000;
    },

    getProgressPercentage() {
      const threshold = this.getNextCouponThreshold();
      return Math.min((this.userStats.totalGastado / threshold) * 100, 100);
    },

    getUserLevel() {
      const totalSpent = this.userStats.totalGastado;
      if (totalSpent >= 5000) return 'Platino';
      if (totalSpent >= 2000) return 'Oro';
      if (totalSpent >= 1000) return 'Plata';
      if (totalSpent >= 500) return 'Bronce';
      return 'Nuevo';
    },

    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    formatPrice(price) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(price || 0);
    }
  },

  created() {
    console.log('🎯 Componente MyProfile creado');
    // Verificar autenticación y cargar perfil
    if (this.checkAuthentication()) {
      this.fetchUserProfile();
    }
  }
};
</script>

<style scoped>
.user-profile-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.breadcrumb-link {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.breadcrumb-link:hover {
  background-color: #e9ecef;
}

.page-title {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.placeholder-icon {
  font-size: 48px;
  color: #dc3545;
  margin-bottom: 16px;
}

.return-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.section-header h2 {
  color: #333;
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: #0056b3;
}

.profile-card {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #6610f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 60px;
}

.profile-info {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 16px;
}

.total-spent {
  font-weight: 700;
  color: #28a745;
  font-size: 18px;
}

.edit-input, .edit-textarea {
  padding: 10px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.edit-input:focus, .edit-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.save-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #545b62;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid #dee2e6;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.progress-info {
  font-size: 14px;
  color: #6c757d;
}

.progress-bar-container {
  margin: 20px 0;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.coupons-section {
  margin-top: 30px;
}

.coupons-section h3 {
  color: #333;
  font-size: 20px;
  margin-bottom: 20px;
}

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.coupon-card {
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.coupon-card.available {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border-color: #28a745;
}

.coupon-card.locked {
  background: linear-gradient(135deg, #f8d7da, #f1b0b7);
  border-color: #dc3545;
  opacity: 0.8;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.coupon-discount {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.coupon-status {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.coupon-card.available .coupon-status {
  color: #28a745;
}

.coupon-card.locked .coupon-status {
  color: #dc3545;
}

.coupon-body h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.coupon-body p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.4;
}

.coupon-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  color: #555;
}

.coupon-code {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  background: rgba(0,0,0,0.1);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.coupon-requirement {
  color: #dc3545;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}

</style>