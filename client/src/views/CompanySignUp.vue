<template>
  <div class="signup-container">
    <AppNavbar />
    <main class="signup-content">
      <div class="signup-card">
        <header class="signup-header">
          <h2>Registro de Empresa</h2>
          <p>Únete a Cougar Club como Gerente</p>
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
                <input type="text" id="fullname" v-model="perfil.nombre" placeholder="Nombre completo" required />
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
            <span v-else>Crear Cuenta de Gerente</span>
          </button>
          <p class="login-link">
            ¿Ya tienes una cuenta? <router-link to="/login">Iniciar Sesión</router-link>
          </p>
        </form>
      </div>
      <div class="benefits-card">
        <div class="benefits-content">
          <h3>Beneficios para Empresas</h3>
          <ul>
            <li>
              <i class="fas fa-store"></i>
              <span>Gestiona tu tienda online de forma profesional</span>
            </li>
            <li>
              <i class="fas fa-users"></i>
              <span>Conecta con miles de clientes potenciales</span>
            </li>
            <li>
              <i class="fas fa-truck"></i>
              <span>Gestiona envíos y entregas de forma eficiente</span>
            </li>
            <li>
              <i class="fas fa-headset"></i>
              <span>Soporte técnico dedicado</span>
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
  name: 'CompanySignUp',
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
      isLoading: false,
      errorMessage: '',
      perfil: {
        nombre: ''
      }
    };
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;
      let score = 0;
      if (this.password.length > 6) score += 20;
      if (this.password.length > 10) score += 20;
      if (/[A-Z]/.test(this.password)) score += 20;
      if (/[0-9]/.test(this.password)) score += 20;
      if (/[^A-Za-z0-9]/.test(this.password)) score += 20;
      return score;
    },
    passwordStrengthColor() {
      if (this.passwordStrength < 40) return '#FF4D4D';
      if (this.passwordStrength < 80) return '#FFA500';
      return '#4CAF50';
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
      try {
        const signupData = {
          email: this.email,
          password: this.password,
          nombre: this.perfil.nombre
        };
        const response = await api.post('/api/auth/register-manager', signupData);
        if (response.data && response.data.token) {
          // Guardar token en localStorage
          localStorage.setItem('token', response.data.token);

          // Decodificar el token para obtener la información del usuario
          const token = response.data.token;
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));

          // Obtener información del usuario desde el payload del token
          const userRole = payload.user.rol || 'Gerente';
          const userName = payload.user.nombre || 'Gerente';
          const userEmail = payload.user.email || this.email;
          const userId = payload.user.id;

          // Guardar información adicional del usuario
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('userName', userName);
          localStorage.setItem('userEmail', userEmail);
          localStorage.setItem('userId', userId);

          // Si el usuario es Gerente, guardar también su compania_id
          if (userRole === 'Gerente' && payload.user.compania_id) {
            localStorage.setItem('userCompany', payload.user.compania_id);
          }

          // Redirigir al dashboard de gerente
          this.$router.push('/gestionar-comercio');
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Error al crear la cuenta de gerente.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style>
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
  min-width: 340px;
}

.benefits-card {
  flex: 1;
  display: flex;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  min-width: 340px;
}

.benefits-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.signup-header {
  text-align: left;
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

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #fcc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
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
  box-shadow: 0 0 0 2px rgba(115, 97, 76, 0.2);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.strength-bar {
  width: 100px;
  height: 10px;
  border-radius: 5px;
  background-color: #f0f0f0;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
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

.signup-btn:hover:enabled {
  background-color: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(115, 97, 76, 0.3);
}

.signup-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
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

@media (max-width: 992px) {
  .signup-content {
    flex-direction: column;
    margin: 1rem auto;
  }
  .signup-card, .benefits-card {
    min-width: unset;
  }
}

@media (max-width: 576px) {
  .signup-content {
    padding: 0 0.5rem;
    margin: 0.5rem auto;
  }
  .signup-card, .benefits-card {
    padding: 1.2rem;
  }
  .benefits-content {
    padding: 1.2rem;
  }
}
</style>