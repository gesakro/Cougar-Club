<template>
  <div class="profile-page">
    <AppNavbar />
    <div class="profile-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Cargando tu perfil...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Oops, algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="loadUserData" class="retry-button">
          <span class="button-icon">🔄</span>
          Reintentar
        </button>
      </div>

      <!-- Main Content -->
      <div v-else class="profile-content">
        <!-- Hero Section -->
        <div class="profile-hero">
          <div class="hero-background"></div>
          <div class="hero-content">
            <div class="avatar-section">
              <div class="avatar-placeholder">
                <span class="avatar-initial">{{ user?.nombre?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </div>
              <div class="welcome-text">
                <h1 class="user-name">¡Hola, {{ user?.nombre || 'Usuario' }}!</h1>
                <p class="welcome-subtitle">Bienvenido a tu perfil personal</p>
              </div>
            </div>
            
            <!-- User Level Badge -->
            <div class="level-section">
              <div class="level-badge" :class="'level-' + userLevel">
                <span class="level-icon">{{ getLevelIcon(userLevel) }}</span>
                <span class="level-text">{{ getLevelName(userLevel) }}</span>
              </div>
              
              <div v-if="nextLevelThreshold" class="progress-section">
                <div class="progress-info">
                  <span class="progress-label">Progreso al siguiente nivel</span>
                  <span class="progress-percentage">{{ Math.round(progressToNextLevel) }}%</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: progressToNextLevel + '%' }"></div>
                </div>
                <p class="progress-text">
                  Solo {{ formatPrice(nextLevelThreshold - stats.totalGastado) }} más para alcanzar 
                  <strong>{{ getLevelName(userLevel + 1) }}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Personal Information Card -->
          <div class="card personal-info-card">
            <div class="card-header">
              <h2 class="card-title">
                <span class="card-icon">👤</span>
                Información Personal
              </h2>
              <p class="card-subtitle">Mantén actualizada tu información</p>
            </div>
            
            <form @submit.prevent="updateProfile" class="info-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nombre completo</label>
                  <input 
                    v-model="user.nombre" 
                    type="text" 
                    class="form-input"
                    :disabled="isLoading"
                    placeholder="Tu nombre completo"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">Correo electrónico</label>
                  <input 
                    v-model="user.email" 
                    type="email" 
                    class="form-input"
                    :disabled="isLoading"
                    placeholder="tu@email.com"
                  >
                </div>
                
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input 
                    v-model="user.telefono" 
                    type="tel" 
                    class="form-input"
                    :disabled="isLoading"
                    placeholder="+1 (555) 123-4567"
                  >
                </div>
                
                <div class="form-group full-width">
                  <label class="form-label">Dirección</label>
                  <input 
                    v-model="user.direccion" 
                    type="text" 
                    class="form-input"
                    :disabled="isLoading"
                    placeholder="Tu dirección completa"
                  >
                </div>
              </div>
              
              <button type="submit" class="save-button" :disabled="isLoading">
                <span v-if="!isLoading" class="button-content">
                  <span class="button-icon">💾</span>
                  Guardar Cambios
                </span>
                <span v-else class="button-content">
                  <div class="button-spinner"></div>
                  Guardando...
                </span>
              </button>
            </form>
          </div>

          <!-- Statistics Card -->
          <div class="card stats-card">
            <div class="card-header">
              <h2 class="card-title">
                <span class="card-icon">📊</span>
                Tus Estadísticas
              </h2>
              <p class="card-subtitle">Resumen de tu actividad</p>
            </div>
            
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-icon purchases">🛍️</div>
                <div class="stat-content">
                  <div class="stat-value">{{ stats?.totalCompras || 0 }}</div>
                  <div class="stat-label">Compras Realizadas</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon spending">💰</div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatPrice(stats?.totalGastado || 0) }}</div>
                  <div class="stat-label">Total Gastado</div>
                </div>
              </div>
              
              <div class="stat-item">
                <div class="stat-icon date">📅</div>
                <div class="stat-content">
                  <div class="stat-value">{{ formatDate(stats?.ultimaCompra) }}</div>
                  <div class="stat-label">Última Compra</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Coupons Card -->
          <div class="card coupons-card">
            <div class="card-header">
              <h2 class="card-title">
                <span class="card-icon">🎟️</span>
                Mis Cupones
              </h2>
              <p class="card-subtitle">Descuentos disponibles y próximos</p>
            </div>
            
            <div class="coupons-container">
              <!-- Available Coupons -->
              <div v-if="coupons.available?.length > 0" class="coupons-section">
                <h3 class="section-title available-title">✅ Disponibles Ahora</h3>
                <div class="coupons-list">
                  <div 
                    v-for="coupon in coupons.available" 
                    :key="coupon._id" 
                    class="coupon-item available"
                    @click="showCoupon(coupon)"
                  >
                    <div class="coupon-header">
                      <h4 class="coupon-name">{{ coupon.name }}</h4>
                      <div class="coupon-value">
                        {{ coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value) }}
                      </div>
                    </div>
                    <p class="coupon-description">{{ coupon.description }}</p>
                    <div class="coupon-action">
                      <span class="action-text">Toca para ver código</span>
                      <span class="action-arrow">→</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Locked Coupons -->
              <div v-if="coupons.locked?.length > 0" class="coupons-section">
                <h3 class="section-title locked-title">🔒 Próximos Descuentos</h3>
                <div class="coupons-list">
                  <div 
                    v-for="coupon in coupons.locked" 
                    :key="coupon._id" 
                    class="coupon-item locked"
                  >
                    <div class="coupon-header">
                      <h4 class="coupon-name">{{ coupon.name }}</h4>
                      <div class="coupon-value locked-value">
                        {{ coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value) }}
                      </div>
                    </div>
                    <p class="coupon-description">{{ coupon.description }}</p>
                    <div class="unlock-info">
                      <span class="unlock-text">
                        Gasta {{ formatPrice(coupon.minPurchase - stats.totalGastado) }} COP más para desbloquear
                      </span>
                      <div class="unlock-progress">
                        <div 
                          class="unlock-fill" 
                          :style="{ width: Math.min((stats.totalGastado / coupon.minPurchase) * 100, 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- No Coupons State -->
              <div v-if="(!coupons.available?.length && !coupons.locked?.length)" class="no-coupons">
                <div class="no-coupons-icon">🎁</div>
                <h3>¡Próximamente tendrás cupones!</h3>
                <p>Sigue comprando para desbloquear descuentos exclusivos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coupon Modal -->
    <transition name="modal">
      <div v-if="showCouponModal" class="modal-overlay" @click="closeCouponModal">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ selectedCoupon?.name }}</h3>
            <button @click="closeCouponModal" class="modal-close">×</button>
          </div>
          
          <div class="modal-body">
            <div class="coupon-showcase">
              <div class="coupon-code-display">{{ selectedCoupon?.code }}</div>
              <p class="coupon-instructions">Copia este código y úsalo en tu próxima compra</p>
            </div>
            
            <div class="modal-actions">
              <button @click="copyCouponCode(selectedCoupon.code)" class="copy-button">
                <span class="button-icon">📋</span>
                Copiar Código
              </button>
              <button @click="closeCouponModal" class="cancel-button">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notifications -->
    <transition name="toast">
      <div v-if="successMessage" class="toast success-toast">
        <span class="toast-icon">✅</span>
        <span class="toast-message">{{ successMessage }}</span>
      </div>
    </transition>
    
    <transition name="toast">
      <div v-if="error" class="toast error-toast">
        <span class="toast-icon">❌</span>
        <span class="toast-message">{{ error }}</span>
      </div>
    </transition>

    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import apiClient from '@/services/axiosConfig';
import PriceService from '@/services/PriceService';

export default {
  name: 'MyProfile',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      user: null,
      stats: null,
      coupons: { available: [], locked: [] },
      isLoading: true,
      error: null,
      successMessage: null,
      showCouponModal: false,
      selectedCoupon: null
    };
  },
  computed: {
    userLevel() {
      if (!this.stats) return 0;
      const totalSpent = this.stats.totalGastado || 0;
      if (totalSpent >= 1000000) return 3;
      if (totalSpent >= 500000) return 2;
      if (totalSpent >= 100000) return 1;
      return 0;
    },
    nextLevelThreshold() {
      const currentLevel = this.userLevel;
      if (currentLevel === 0) return 100000;
      if (currentLevel === 1) return 500000;
      if (currentLevel === 2) return 1000000;
      return null;
    },
    progressToNextLevel() {
      if (!this.nextLevelThreshold || !this.stats) return 0;
      const totalSpent = this.stats.totalGastado || 0;
      let previousThreshold = 0;
      if (this.userLevel === 1) previousThreshold = 100000;
      if (this.userLevel === 2) previousThreshold = 500000;
      
      const progress = ((totalSpent - previousThreshold) / (this.nextLevelThreshold - previousThreshold)) * 100;
      return Math.min(Math.max(progress, 0), 100);
    }
  },
  methods: {
    getLevelName(level) {
      const names = ['Nuevo', 'Bronce', 'Plata', 'Oro', 'Platino'];
      return names[level] || 'Platino';
    },
    getLevelIcon(level) {
      const icons = ['🌱', '🥉', '🥈', '🥇', '💎'];
      return icons[level] || '💎';
    },
    async loadUserData() {
      this.isLoading = true;
      this.error = null;
      try {
        // Obtener datos actualizados del servidor
        const [profileResponse, statsResponse, couponsResponse] = await Promise.all([
          apiClient.get('/users/profile'),
          apiClient.get('/users/stats'),
          apiClient.get('/users/coupons')
        ]);

        // Actualizar con los datos del servidor
        if (profileResponse.data) {
          // Asegurarse de que todos los campos necesarios estén presentes
          this.user = {
            id: profileResponse.data.id,
            nombre: profileResponse.data.nombre || '',
            email: profileResponse.data.email || '',
            telefono: profileResponse.data.telefono || '',
            direccion: profileResponse.data.direccion || '',
            rol: profileResponse.data.rol,
            compania_id: profileResponse.data.compania_id
          };
          
          // Guardar en localStorage solo si tenemos datos válidos
          localStorage.setItem('userProfile', JSON.stringify(this.user));
        }
        
        if (statsResponse.data) {
          this.stats = statsResponse.data;
        }
        
        if (couponsResponse.data) {
          this.coupons = couponsResponse.data;
        }

      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        // Intentar cargar datos del localStorage como respaldo
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            this.user = JSON.parse(savedProfile);
          } catch (e) {
            console.error('Error al parsear datos guardados:', e);
          }
        }
        this.error = error.response?.data?.message || 'No pudimos cargar tu información. Por favor, intenta de nuevo.';
      } finally {
        this.isLoading = false;
      }
    },
    async updateProfile() {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
      
      try {
        // Preparar los datos a enviar
        const userData = {
          nombre: this.user.nombre?.trim() || '',
          email: this.user.email?.trim() || '',
          telefono: this.user.telefono?.trim() || '',
          direccion: this.user.direccion?.trim() || ''
        };

        // Enviar la actualización al backend
        const response = await apiClient.put('/users/profile', userData);

        // Actualizar el estado local con la respuesta del servidor
        if (response.data) {
          // Actualizar el objeto user con los nuevos datos
          this.user = {
            ...this.user,
            nombre: response.data.nombre,
            email: response.data.email,
            telefono: response.data.telefono,
            direccion: response.data.direccion
          };

          // Guardar en localStorage para persistencia
          localStorage.setItem('userProfile', JSON.stringify(this.user));
          this.successMessage = '¡Perfil actualizado correctamente!';
        } else {
          throw new Error('No se recibió respuesta del servidor');
        }
        
        // Auto-hide success message
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      } catch (error) {
        console.error('Error al actualizar perfil:', error);
        // Manejar diferentes tipos de errores
        if (error.response?.status === 500) {
          this.error = 'Error en el servidor. Por favor, intenta más tarde.';
        } else if (error.response?.data?.message) {
          this.error = error.response.data.message;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'No pudimos guardar los cambios. Intenta de nuevo.';
        }
        
        // Auto-hide error message
        setTimeout(() => {
          this.error = null;
        }, 5000);
      } finally {
        this.isLoading = false;
      }
    },
    showCoupon(coupon) {
      this.selectedCoupon = coupon;
      this.showCouponModal = true;
    },
    async copyCouponCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.successMessage = '¡Código copiado al portapapeles!';
        this.closeCouponModal();
        
        // Auto-hide success message
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      } catch (error) {
        console.error('Error al copiar código:', error);
        this.error = 'No pudimos copiar el código. Inténtalo manualmente.';
        
        // Auto-hide error message
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    },
    closeCouponModal() {
      this.showCouponModal = false;
      this.selectedCoupon = null;
    },
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatPrice(price) {
      if (!price && price !== 0) return 'N/A';
      return PriceService.formatPrice(price);
    }
  },
  created() {
    this.loadUserData();
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f5f3, #f1ede8);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8e3dc;
  border-top: 4px solid #b8a082;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #8b7355;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

/* Error States */
.error-state {
  text-align: center;
  padding: 60px 30px;
  background: #faf9f7;
  border-radius: 16px;
  border: 2px solid #e8e3dc;
  box-shadow: 0 4px 20px rgba(184, 160, 130, 0.1);
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #8b7355;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.error-state p {
  color: #a0927b;
  font-size: 16px;
  margin: 0 0 30px 0;
  line-height: 1.5;
}

.retry-button {
  background: linear-gradient(135deg, #b8a082, #a08968);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(184, 160, 130, 0.3);
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(184, 160, 130, 0.4);
  background: linear-gradient(135deg, #a08968, #8b7355);
}

/* Hero Section */
.profile-hero {
  position: relative;
  background: linear-gradient(135deg, #faf9f7, #f4f1eb);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 8px 32px rgba(184, 160, 130, 0.15);
  border: 1px solid #e8e3dc;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(184, 160, 130, 0.1), transparent);
  border-radius: 50%;
  transform: translate(100px, -100px);
}

.hero-content {
  position: relative;
  z-index: 2;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 35px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8a082, #a08968);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(184, 160, 130, 0.3);
}

.welcome-text h1 {
  color: #5d4e37;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  color: #8b7355;
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* Level Section */
.level-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  max-width: fit-content;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.level-0 { background: linear-gradient(135deg, #e8e3dc, #d4c7b5); color: #8b7355; }
.level-1 { background: linear-gradient(135deg, #deb887, #cd853f); color: #5d4e37; }
.level-2 { background: linear-gradient(135deg, #c0c0c0, #a8a8a8); color: #4a4a4a; }
.level-3 { background: linear-gradient(135deg, #ffd700, #ffa500); color: #8b4513; }

.progress-section {
  background: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e8e3dc;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  color: #8b7355;
  font-weight: 500;
  font-size: 14px;
}

.progress-percentage {
  color: #b8a082;
  font-weight: 700;
  font-size: 16px;
}

.progress-track {
  height: 8px;
  background: #e8e3dc;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #b8a082, #a08968);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-text {
  color: #8b7355;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

/* Card Styles */
.card {
  background: #faf9f7;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 6px 25px rgba(184, 160, 130, 0.12);
  border: 1px solid #e8e3dc;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(184, 160, 130, 0.2);
}

.card-header {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8e3dc;
}

.card-title {
  color: #5d4e37;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 24px;
}

.card-subtitle {
  color: #8b7355;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

/* Form Styles */
.info-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  color: #8b7355;
  font-weight: 600;
  font-size: 14px;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e8e3dc;
  border-radius: 10px;
  font-size: 16px;
  background: #ffffff;
  color: #5d4e37;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #b8a082;
  box-shadow: 0 0 0 3px rgba(184, 160, 130, 0.1);
}

.form-input:disabled {
  background: #f4f1eb;
  cursor: not-allowed;
  opacity: 0.7;
}

.save-button {
  background: linear-gradient(135deg, #b8a082, #a08968);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(184, 160, 130, 0.3);
}

.save-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #a08968, #8b7355);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(184, 160, 130, 0.4);
}

.save-button:disabled {
  background: #d4c7b5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Statistics Card */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff, #f7f5f3);
  border-radius: 12px;
  border: 1px solid #e8e3dc;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(184, 160, 130, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.purchases {
  background: linear-gradient(135deg, #e8e3dc, #d4c7b5);
}

.stat-icon.spending {
  background: linear-gradient(135deg, #b8a082, #a08968);
  color: white;
}

.stat-icon.date {
  background: linear-gradient(135deg, #deb887, #cd853f);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #5d4e37;
  margin-bottom: 4px;
}

.stat-label {
  color: #8b7355;
  font-size: 14px;
  font-weight: 500;
}

/* Coupons Card */
.coupons-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.coupons-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  color: #5d4e37;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.available-title {
  color: #2d5016;
}

.locked-title {
  color: #8b4513;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.coupon-item {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
  cursor: pointer;
}

.coupon-item.available {
  background: linear-gradient(135deg, #f0f8f0, #e8f5e8);
  border-color: #90c695;
}

.coupon-item.available:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(144, 198, 149, 0.3);
  border-color: #7bb77f;
}

.coupon-item.locked {
  background: linear-gradient(135deg, #f8f4f0, #f5ede8);
  border-color: #d4c7b5;
  cursor: default;
  opacity: 0.8;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.coupon-name {
  color: #5d4e37;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.coupon-value {
  font-size: 20px;
  font-weight: 700;
  color: #2d5016;
  background: rgba(144, 198, 149, 0.2);
  padding: 6px 12px;
  border-radius: 8px;
}

.locked-value {
  color: #8b7355;
  background: rgba(212, 199, 181, 0.3);
}

.coupon-description {
  color: #8b7355;
  font-size: 14px;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.coupon-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #2d5016;
  font-size: 14px;
  font-weight: 500;
}

.action-arrow {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.coupon-item.available:hover .action-arrow {
  transform: translateX(5px);
}

.unlock-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.unlock-text {
  color: #8b7355;
  font-size: 13px;
  font-weight: 500;
}

.unlock-progress {
  height: 6px;
  background: #e8e3dc;
  border-radius: 3px;
  overflow: hidden;
}

.unlock-fill {
  height: 100%;
  background: linear-gradient(90deg, #b8a082, #a08968);
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* No Coupons State */
.no-coupons {
  text-align: center;
  padding: 40px 20px;
  color: #8b7355;
}

.no-coupons-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.no-coupons h3 {
  color: #5d4e37;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.no-coupons p {
  color: #8b7355;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(93, 78, 55, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-card {
  background: #faf9f7;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(93, 78, 55, 0.3);
  border: 1px solid #e8e3dc;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 20px;
  border-bottom: 2px solid #e8e3dc;
}

.modal-title {
  color: #5d4e37;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #8b7355;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #e8e3dc;
  color: #5d4e37;
}

.modal-body {
  padding: 30px;
}

.coupon-showcase {
  text-align: center;
  margin-bottom: 30px;
}

.coupon-code-display {
  background: linear-gradient(135deg, #b8a082, #a08968);
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: 700;
  padding: 20px 30px;
  border-radius: 12px;
  margin-bottom: 15px;
  letter-spacing: 2px;
  box-shadow: 0 6px 20px rgba(184, 160, 130, 0.3);
}

.coupon-instructions {
  color: #8b7355;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.copy-button {
  background: linear-gradient(135deg, #2d5016, #4a7c2a);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(45, 80, 22, 0.3);
}

.copy-button:hover {
  background: linear-gradient(135deg, #4a7c2a, #5d8c3a);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 80, 22, 0.4);
}

.cancel-button {
  background: #8b7355;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #a08968;
  transform: translateY(-2px);
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  z-index: 1100;
  backdrop-filter: blur(10px);
}

.success-toast {
  background: linear-gradient(135deg, rgba(45, 80, 22, 0.95), rgba(74, 124, 42, 0.95));
  color: white;
  border: 1px solid rgba(144, 198, 149, 0.3);
}

.error-toast {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(160, 82, 45, 0.95));
  color: white;
  border: 1px solid rgba(222, 184, 135, 0.3);
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-size: 14px;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-container {
    padding: 20px 15px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .profile-hero {
    padding: 25px 20px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .welcome-text h1 {
    font-size: 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-card {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header, .modal-body {
    padding: 20px;
  }
  
  .coupon-code-display {
    font-size: 18px;
    padding: 15px 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
  }
}

@media (max-width: 480px) {
  .profile-hero {
    padding: 20px 15px;
  }
  
  .card {
    padding: 20px;
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .coupon-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>