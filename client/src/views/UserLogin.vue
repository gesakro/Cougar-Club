<template>
  <div>
    <AppNavbar />
    <div class="login-container">
      <main class="login-content">
        <div class="login-card">
          <header class="login-header">
            <h2>Iniciar Sesión</h2>
            <p>Bienvenido de nuevo a Cougar Club</p>
          </header>
          
          <form class="login-form" @submit.prevent="handleLogin">
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
                  placeholder="Introduce tu contraseña" 
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
            </div>
            
            <div class="form-options">
              <div class="remember-me">
                <input type="checkbox" id="remember" v-model="rememberMe" />
                <label for="remember">Recordarme</label>
              </div>
              <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button type="submit" class="signin-btn">Iniciar Sesión</button>
            
            <div class="divider">
              <span>O continúa con</span>
            </div>
            
            <div class="social-login">
              <button type="button" class="google-btn">
                <i class="fab fa-google"></i>
                Google
              </button>
              <button type="button" class="facebook-btn">
                <i class="fab fa-facebook-f"></i>
                Facebook
              </button>
            </div>
            
            <p class="signup-link">
              ¿No tienes una cuenta? <router-link to="/signup">Crear cuenta</router-link>
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
            </ul>
            <div class="brand-logo">
              <span>Cougar Club</span>
            </div>
          </div>
        </div>
      </main>
      
      <footer class="login-footer">
        <div class="footer-links">
          <div class="footer-column">
            <h4>Ayuda</h4>
            <ul>
              <li><a href="#">Centro de ayuda</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Servicios</h4>
            <ul>
              <li><a href="#">Envíos</a></li>
              <li><a href="#">Devoluciones</a></li>
              <li><a href="#">Garantía</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Sobre Cougar Club</h4>
            <ul>
              <li><a href="#">Nuestra historia</a></li>
              <li><a href="#">Sostenibilidad</a></li>
              <li><a href="#">Trabaja con nosotros</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Suscríbete</h4>
            <p>Recibe noticias y ofertas exclusivas</p>
            <div class="subscribe-form">
              <input type="email" placeholder="Tu email" />
              <button>Suscribir</button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-brand">Cougar Club &copy; 2025</p>
          <div class="social-icons">
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </footer>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from '@/components/layout/AppFooter.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';

export default {
  name: 'UserLogin',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false
    };
  },
  methods: {
    handleLogin() {
      console.log('Login attempt with:', this.email, this.password);
      // Aquí añadirías la lógica de autenticación
    }
  }
};
</script>

<style>
/* Estilos para el login */
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

.login-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.login-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 992px) {
  .login-content {
    flex-direction: column;
  }
}

.login-card, .benefits-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.login-card {
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

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-light);
}

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-me input[type="checkbox"] {
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
}

.remember-me input[type="checkbox"]:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.remember-me input[type="checkbox"]:checked::before {
  content: '\f00c';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  color: white;
  font-size: 0.7rem;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: var(--transition);
}

.forgot-password:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.signin-btn {
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
}

.signin-btn:hover {
  background-color: var(--secondary-color);
  box-shadow: 0 4px 12px rgba(64, 133, 197, 0.3);
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

.social-login {
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

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-light);
  font-size: 0.95rem;
}

.signup-link a {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.signup-link a:hover {
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

/* Footer Styles */
.login-footer {
  margin-top: 3rem;
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-column {
  flex: 1;
  min-width: 200px;
}

.footer-column h4 {
  color: var(--text-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-column ul {
  list-style: none;
}

.footer-column ul li {
  margin-bottom: 0.8rem;
}

.footer-column ul li a {
  color: var(--text-light);
  text-decoration: none;
  transition: var(--transition);
}

.footer-column ul li a:hover {
  color: var(--primary-color);
}

.subscribe-form {
  display: flex;
  margin-top: 1rem;
}

.subscribe-form input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px 0 0 8px;
  outline: none;
}

.subscribe-form button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0 1rem;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: var(--transition);
}

.subscribe-form button:hover {
  background-color: var(--secondary-color);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.footer-brand {
  font-weight: 600;
  font-size: 1.1rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #f0f2f5;
  border-radius: 50%;
  color: var(--text-light);
  text-decoration: none;
  transition: var(--transition);
}

.social-icons a:hover {
  background-color: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .login-card, .benefits-card {
    padding: 1.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-column {
    width: 100%;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>