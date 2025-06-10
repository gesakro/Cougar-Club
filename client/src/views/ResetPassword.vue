<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-card">
        <div class="card-header">
          <h1>Restablecer Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form @submit.prevent="resetPassword" class="reset-form">
          <div class="form-group">
            <label for="password">Nueva Contraseña</label>
            <div class="input-with-icon">
              <i class="fas fa-lock"></i>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                placeholder="Ingresa tu nueva contraseña" 
                required 
                minlength="6"
              />
              <i 
                class="fas" 
                :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="showPassword = !showPassword"
                style="right: 1rem; left: auto; cursor: pointer;"
              ></i>
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
                placeholder="Confirma tu nueva contraseña" 
                required 
                minlength="6"
              />
              <i 
                class="fas" 
                :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="showConfirmPassword = !showConfirmPassword"
                style="right: 1rem; left: auto; cursor: pointer;"
              ></i>
            </div>
          </div>

          <button type="submit" class="reset-button" :disabled="isLoading || !isFormValid">
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              Actualizando...
            </span>
            <span v-else>Actualizar Contraseña</span>
          </button>
        </form>

        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ successMessage }}
        </div>

        <div class="form-footer">
          <router-link to="/login" class="back-to-login">
            <i class="fas fa-arrow-left"></i>
            Volver al inicio de sesión
          </router-link>
        </div>
      </div>

      <div class="info-card">
        <div class="info-content">
          <h2>Recomendaciones de Seguridad</h2>
          <ul>
            <li>
              <i class="fas fa-key"></i>
              <span>Usa al menos 6 caracteres</span>
            </li>
            <li>
              <i class="fas fa-shield-alt"></i>
              <span>Incluye letras mayúsculas y minúsculas</span>
            </li>
            <li>
              <i class="fas fa-hashtag"></i>
              <span>Agrega números y caracteres especiales</span>
            </li>
            <li>
              <i class="fas fa-user-shield"></i>
              <span>No uses contraseñas que hayas usado antes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPassword',
  data() {
    return {
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  computed: {
    isFormValid() {
      return this.password && 
             this.confirmPassword && 
             this.password === this.confirmPassword &&
             this.password.length >= 6;
    }
  },
  methods: {
    async resetPassword() {
      if (!this.isFormValid) {
        this.errorMessage = 'Las contraseñas no coinciden o son demasiado cortas';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const token = this.$route.params.token;
        await axios.post('http://localhost:5000/api/auth/reset-password', {
          token,
          password: this.password
        });

        this.successMessage = 'Contraseña actualizada exitosamente';
        this.password = '';
        this.confirmPassword = '';

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Error al actualizar la contraseña. Por favor, intenta nuevamente.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style>
/* Estilos para la página de restablecimiento de contraseña */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #73614C;
  --secondary-color: #401202;
  --accent-color: #ff6b6b;
  --background-color: #f3e8d5;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-light: #777777;
  --border-color: #e1e5ea;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}

.reset-password-page {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 2rem 1rem;
}

.reset-password-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 992px) {
  .reset-password-container {
    flex-direction: column;
  }
}

.reset-password-card, .info-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.reset-password-card {
  flex: 1;
  padding: 2.5rem;
}

.info-card {
  flex: 1;
  display: flex;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.info-content {
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.card-header h1 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.card-header p {
  color: var(--text-light);
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.reset-button {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.reset-button:hover:not(:disabled) {
  background-color: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(64, 18, 2, 0.3);
}

.reset-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background: #fff5f5;
  color: #e53e3e;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.success-message {
  background: #f0fff4;
  color: #38a169;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.back-to-login {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition);
}

.back-to-login:hover {
  color: var(--secondary-color);
}

.info-card h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.8rem;
}

.info-card h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: white;
}

.info-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card li {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.05rem;
}

.info-card li i {
  font-size: 1.5rem;
  width: 30px;
  text-align: center;
}

@media (max-width: 768px) {
  .reset-password-card, .info-card {
    padding: 1.5rem;
  }
  
  .card-header h1 {
    font-size: 1.5rem;
  }
  
  .info-card h2 {
    font-size: 1.5rem;
  }
}
</style> 