<template>
  <div class="reset-request-page">
    <div class="reset-request-container">
      <div class="reset-request-card">
        <div class="card-header">
          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu correo electrónico para recibir el enlace de restablecimiento</p>
        </div>

        <form @submit.prevent="requestReset" class="reset-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                placeholder="ejemplo@correo.com" 
                required 
              />
            </div>
          </div>

          <button type="submit" class="reset-button" :disabled="isLoading">
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i>
              Enviando...
            </span>
            <span v-else>Enviar Enlace</span>
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
          <h2>¿Olvidaste tu contraseña?</h2>
          <ul>
            <li>
              <i class="fas fa-envelope"></i>
              <span>Recibirás un enlace de restablecimiento en tu correo electrónico</span>
            </li>
            <li>
              <i class="fas fa-clock"></i>
              <span>El enlace expirará en 1 hora por seguridad</span>
            </li>
            <li>
              <i class="fas fa-lock"></i>
              <span>Usa el enlace para crear una nueva contraseña segura</span>
            </li>
            <li>
              <i class="fas fa-shield-alt"></i>
              <span>Si no solicitaste el restablecimiento, ignora el correo</span>
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
  name: 'RequestPasswordReset',
  data() {
    return {
      email: '',
      isLoading: false,
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async requestReset() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        await axios.post('http://localhost:5000/api/auth/request-password-reset', {
          email: this.email
        });

        this.successMessage = 'Se ha enviado un enlace a tu correo electrónico. Por favor, revisa tu bandeja de entrada.';
        this.email = '';
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Ha ocurrido un error al solicitar el restablecimiento. Por favor, intenta nuevamente.';
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style>
/* Estilos para la página de recuperación de contraseña */
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

.reset-request-page {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 2rem 1rem;
}

.reset-request-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 992px) {
  .reset-request-container {
    flex-direction: column;
  }
}

.reset-request-card, .info-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.reset-request-card {
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
  .reset-request-card, .info-card {
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