<template>
  <div class="signup-container">
    <AppNavbar />
    <main class="signup-content">
      <div class="signup-card">
        <header class="signup-header">
          <h2>Crear Cuenta</h2>
          <p>Únete a Cougar Club</p>
        </header>
        
        <form class="signup-form" @submit.prevent="handleSignup">
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="fullname">Nombre completo</label>
              <div class="input-with-icon">
                <i class="fas fa-user"></i>
                <input type="text" id="fullname" v-model="perfil.nombre" placeholder="Tu nombre completo" required />
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input type="email" id="email" v-model="email" placeholder="ejemplo@correo.com" required />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                placeholder="Crea una contraseña segura" 
                required 
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="password-strength" v-if="password">
              <div class="strength-bar">
                <div class="strength-indicator" :style="{ width: passwordStrength + '%', backgroundColor: passwordStrengthColor }"></div>
              </div>
              <span :style="{ color: passwordStrengthColor }">{{ passwordStrengthText }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                placeholder="Confirma tu contraseña" 
                required 
              />
              <button 
                type="button" 
                class="toggle-password" 
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p class="password-match" v-if="password && confirmPassword" :class="{ match: passwordsMatch, mismatch: !passwordsMatch }">
              <i :class="passwordsMatch ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              {{ passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}
            </p>
          </div>
          
          <div class="form-checkbox">
            <input type="checkbox" id="terms" v-model="acceptTerms" required />
            <label for="terms">Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a></label>
          </div>
          
          
          <button type="submit" class="signup-btn" :disabled="!formValid || isLoading">
            <span v-if="isLoading"><i class="fas fa-spinner fa-spin"></i> Registrando...</span>
            <span v-else>Crear Cuenta</span>
          </button>
          
          <div class="divider">
            <span>O regístrate con</span>
          </div>
          
          <div class="social-signup">
            <button type="button" class="google-btn">
              <i class="fab fa-google"></i>
              Google
            </button>
            <button type="button" class="facebook-btn">
              <i class="fab fa-facebook-f"></i>
              Facebook
            </button>
          </div>
          
          <p class="login-link">
            ¿Ya tienes una cuenta? <router-link to="/login">Iniciar Sesión</router-link>
          </p>
        </form>
      </div>
      
      <div class="benefits-card">
        <div class="benefits-content">
          <h3>Ventajas de Cougar Club</h3>
          <ul>
            <li>
              <i class="fas fa-shopping-bag"></i>
              <span>Accede a tu historial de compras y productos</span>
            </li>
            <li>
              <i class="fas fa-user-circle"></i>
              <span>Gestiona tu información personal</span>
            </li>
            <li>
              <i class="fas fa-bell"></i>
              <span>Recibe notificaciones y ofertas exclusivas</span>
            </li>
            <li>
              <i class="fas fa-tag"></i>
              <span>Descuentos especiales para miembros</span>
            </li>
            <li>
              <i class="fas fa-shield-alt"></i>
              <span>Protección de datos y seguridad garantizada</span>
            </li>
          </ul>
          <div class="brand-logo">
            <span>Cougar Club</span>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from '@/components/layout/AppFooter.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import api from '@/api/api';

export default {
  name: 'UserSignup',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      acceptTerms: false,
      subscribeNewsletter: false,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      perfil: {
        nombre: '',
        telefono: '',
        direccion: '',
        preferencias: {
          newsletter: false
        }
      }
    };
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;
      
      let score = 0;
      // Longitud de la contraseña
      if (this.password.length > 6) score += 20;
      if (this.password.length > 10) score += 20;
      
      // Complejidad
      if (/[A-Z]/.test(this.password)) score += 20;  // Mayúsculas
      if (/[0-9]/.test(this.password)) score += 20;  // Números
      if (/[^A-Za-z0-9]/.test(this.password)) score += 20;  // Caracteres especiales
      
      return score;
    },
    passwordStrengthColor() {
      if (this.passwordStrength < 40) return '#FF4D4D';  // Débil
      if (this.passwordStrength < 80) return '#FFA500';  // Media
      return '#4CAF50';  // Fuerte
    },
    passwordStrengthText() {
      if (this.passwordStrength < 40) return 'Débil';
      if (this.passwordStrength < 80) return 'Media';
      return 'Fuerte';
    },
    passwordsMatch() {
      return this.password === this.confirmPassword && this.password.length > 0;
    },
    formValid() {
      return (
        this.perfil.nombre.trim() !== '' &&
        this.email.trim() !== '' &&
        this.password.trim() !== '' &&
        this.confirmPassword.trim() !== '' &&
        this.passwordsMatch &&
        this.acceptTerms
      );
    }
  },
  methods: {
    async handleSignup() {
      if (!this.formValid) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // Preparar los datos de registro
        const signupData = {
          email: this.email,
          password: this.password,
          nombre: this.perfil.nombre,
          rol: 'Usuario' // Especificar explícitamente el rol como Usuario
        };

        // Llamada a la API para registrar al usuario normal
        const response = await api.post('/api/auth/register', signupData);

        // Si el registro es exitoso, guardar el token en localStorage
        if (response.data && response.data.token) {
          // Guardar token en localStorage
          localStorage.setItem('token', response.data.token);
          
          // Decodificar el token para obtener la información del usuario
          const token = response.data.token;
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Obtener información del usuario desde el payload del token
          const userRole = payload.user.rol || 'Usuario';
          const userName = payload.user.nombre || 'Usuario';
          const userEmail = payload.user.email || this.email;
          const userId = payload.user.id;
          
          // Guardar información adicional del usuario
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userName', userName);
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('userId', userId);
          
          // Mostrar mensaje de éxito
          this.successMessage = `¡Bienvenido ${userName}! Tu cuenta ha sido creada exitosamente.`;
          
          // Redirigir al usuario al dashboard o página principal después de un breve retraso
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
        }
      } catch (error) {
        console.error('Error en el registro:', error);
        this.errorMessage = error.response?.data?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
  
<style>
/* Estilos para la página de registro (SignUp) */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #73614C;
  --secondary-color: #401202;
  --accent-color: #ff6b6b;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-light: #777777;
  --border-color: #e1e5ea;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  --transition: all 0.3s ease;
}

.signup-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
}

.signup-content {
  flex: 1 0 auto;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin: 2rem auto;
  padding: 0 1rem;
  max-width: 1200px;
  width: 100%;
}

.signup-card, .benefits-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.signup-card {
  flex: 1;
  padding: 2.5rem;
}

.benefits-card {
  flex: 1;
  display: flex;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.benefits-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-header h2 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.signup-header p {
  color: var(--text-light);
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

@media (max-width: 992px) {
  .signup-content {
    flex-direction: column;
    margin: 1rem auto;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  color: var(--text-light);
}

.input-with-icon input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.input-with-icon input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 110, 165, 0.2);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 1rem;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-indicator {
  height: 100%;
  border-radius: 2px;
  transition: var(--transition);
}

.password-match {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-match.match {
  color: #4CAF50;
}

.password-match.mismatch {
  color: #FF4D4D;
}

.form-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.form-checkbox input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.form-checkbox input[type="checkbox"]:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.form-checkbox input[type="checkbox"]:checked::before {
  content: '\f00c';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: white;
  font-size: 0.7rem;
}

.form-checkbox label {
  color: var(--text-color);
  font-size: 0.95rem;
}

.form-checkbox label a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.form-checkbox label a:hover {
  text-decoration: underline;
}

.signup-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}

.signup-btn:hover {
  background-color: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(0, 78, 152, 0.3);
}

.signup-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--border-color);
}

.divider span {
  position: relative;
  background-color: var(--card-background);
  padding: 0 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.social-signup {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.google-btn, .facebook-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: white;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.google-btn:hover, .facebook-btn:hover {
  background-color: #f9f9f9;
}

.google-btn i {
  color: #DB4437;
}

.facebook-btn i {
  color: #4267B2;
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-light);
  font-size: 0.95rem;
}

.login-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.login-link a:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.benefits-card h3 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.benefits-card h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: white;
}

.benefits-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.benefits-card li {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.05rem;
}

.benefits-card li i {
  font-size: 1.5rem;
  width: 30px;
  text-align: center;
}

.brand-logo {
  margin-top: auto;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 1px;
}

@media (max-width: 576px) {
  .signup-content {
    padding: 0 0.5rem;
    margin: 0.5rem auto;
  }
  .signup-card, .benefits-card {
    padding: 1.2rem;
  }
}
</style>