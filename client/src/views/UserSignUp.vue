<template>
    <div>
      <AppNavbar />
      <div class="signup-container">
        <main class="signup-content">
          <div class="signup-card">
            <header class="signup-header">
              <h2>Crear Cuenta</h2>
              <p>Únete a Cougar Club</p>
            </header>
            
            <form class="signup-form" @submit.prevent="handleSignup">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstname">Nombre</label>
                  <div class="input-with-icon">
                    <i class="fas fa-user"></i>
                    <input type="text" id="firstname" v-model="firstname" placeholder="Tu nombre" required />
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="lastname">Apellido</label>
                  <div class="input-with-icon">
                    <i class="fas fa-user"></i>
                    <input type="text" id="lastname" v-model="lastname" placeholder="Tu apellido" required />
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
              
              <div class="form-checkbox">
                <input type="checkbox" id="newsletter" v-model="subscribeNewsletter" />
                <label for="newsletter">Quiero recibir noticias, ofertas y promociones</label>
              </div>
              
              <button type="submit" class="signup-btn" :disabled="!formValid">Crear Cuenta</button>
              
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
        
        <footer class="signup-footer">
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
    name: 'UserSignup',
    components: {
      AppNavbar,
      AppFooter
    },
    data() {
      return {
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        acceptTerms: false,
        subscribeNewsletter: false
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
          this.firstname.trim() !== '' &&
          this.lastname.trim() !== '' &&
          this.email.trim() !== '' &&
          this.password.trim() !== '' &&
          this.confirmPassword.trim() !== '' &&
          this.passwordsMatch &&
          this.acceptTerms
        );
      }
    },
    methods: {
      handleSignup() {
        console.log('Signup attempt with:', {
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          subscribeNewsletter: this.subscribeNewsletter
        });
        // Aquí añadirías la lógica de registro
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

.signup-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.signup-content {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 992px) {
  .signup-content {
    flex-direction: column;
  }
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

@media (max-width: 576px) {
  .form-row {
    flex-direction: column;
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

/* Footer Styles */
.signup-footer {
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
  .signup-card, .benefits-card {
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