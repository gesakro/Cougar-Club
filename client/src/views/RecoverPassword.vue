<template>
    <div>
      <AppNavbar />
      <div class="recover-container">
        <main class="recover-content">
          <div class="recover-card">
            <header class="recover-header">
              <h2>Recuperar Contraseña</h2>
              <p>Ingresa tu email para restablecer tu contraseña</p>
            </header>
            
            <form class="recover-form" @submit.prevent="handleRecover">
              <div class="form-group">
                <label for="email">Email</label>
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
                <small class="form-info">Te enviaremos un enlace para crear una nueva contraseña</small>
              </div>
              
              <div v-if="step === 'verification'" class="form-group">
                <label for="code">Código de verificación</label>
                <div class="input-with-icon">
                  <i class="fas fa-key"></i>
                  <input 
                    type="text" 
                    id="code" 
                    v-model="verificationCode" 
                    placeholder="Ingresa el código de 6 dígitos" 
                    maxlength="6"
                    required 
                  />
                </div>
                <small class="form-info">Introduce el código enviado a tu email</small>
              </div>
              
              <div v-if="step === 'new-password'" class="form-group">
                <label for="new-password">Nueva contraseña</label>
                <div class="input-with-icon">
                  <i class="fas fa-lock"></i>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    id="new-password" 
                    v-model="newPassword" 
                    placeholder="Introduce tu nueva contraseña" 
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
              
              <div v-if="step === 'new-password'" class="form-group">
                <label for="confirm-password">Confirmar contraseña</label>
                <div class="input-with-icon">
                  <i class="fas fa-lock"></i>
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    id="confirm-password" 
                    v-model="confirmPassword" 
                    placeholder="Confirma tu nueva contraseña" 
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
                <small class="password-match" :class="{ 'match': passwordsMatch, 'not-match': !passwordsMatch && confirmPassword }">
                  <i :class="passwordsMatch ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden' }}
                </small>
              </div>
              
              <div v-if="statusMessage" class="status-message" :class="{ 'success': messageType === 'success', 'error': messageType === 'error' }">
                <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                {{ statusMessage }}
              </div>
              
              <button 
                type="submit" 
                class="recover-btn"
                :disabled="isNextButtonDisabled"
              >
                {{ buttonText }}
              </button>
              
              <p class="back-to-login">
                <router-link to="/login">
                  <i class="fas fa-arrow-left"></i> Volver a iniciar sesión
                </router-link>
              </p>
            </form>
          </div>
          
          <div class="steps-card">
            <div class="steps-content">
              <h3>Recupera tu cuenta en 3 pasos</h3>
              
              <ul class="steps-list">
                <li :class="{ 'active': step === 'email', 'completed': step === 'verification' || step === 'new-password' || step === 'success' }">
                  <div class="step-number">1</div>
                  <div class="step-info">
                    <h4>Verificación de Email</h4>
                    <p>Ingresa tu dirección de email asociada a tu cuenta</p>
                  </div>
                </li>
                
                <li :class="{ 'active': step === 'verification', 'completed': step === 'new-password' || step === 'success' }">
                  <div class="step-number">2</div>
                  <div class="step-info">
                    <h4>Código de Verificación</h4>
                    <p>Introduce el código de seguridad enviado a tu email</p>
                  </div>
                </li>
                
                <li :class="{ 'active': step === 'new-password', 'completed': step === 'success' }">
                  <div class="step-number">3</div>
                  <div class="step-info">
                    <h4>Nueva Contraseña</h4>
                    <p>Crea una nueva contraseña segura para tu cuenta</p>
                  </div>
                </li>
              </ul>
              
              <div class="step-security-info">
                <i class="fas fa-shield-alt"></i>
                <p>Por seguridad, el enlace enviado a tu email expirará en 30 minutos</p>
              </div>
              
              <div class="brand-logo">
                <span>Cougar Club</span>
              </div>
            </div>
          </div>
        </main>
        
        <footer class="recover-footer">
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
    name: 'PasswordRecovery',
    components: {
      AppNavbar,
      AppFooter
    },
    data() {
      return {
        step: 'email', // 'email', 'verification', 'new-password', 'success'
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false,
        statusMessage: '',
        messageType: '' // 'success' o 'error'
      };
    },
    computed: {
      buttonText() {
        switch(this.step) {
          case 'email':
            return 'Enviar código';
          case 'verification':
            return 'Verificar código';
          case 'new-password':
            return 'Actualizar contraseña';
          case 'success':
            return 'Volver a iniciar sesión';
          default:
            return 'Continuar';
        }
      },
      passwordsMatch() {
        return this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword;
      },
      isNextButtonDisabled() {
        if (this.step === 'new-password') {
          return !this.newPassword || !this.confirmPassword || !this.passwordsMatch;
        }
        return false;
      }
    },
    methods: {
      handleRecover() {
        // Simulación del proceso de recuperación
        if (this.step === 'email') {
          // Validar email y enviar código
          if (this.isValidEmail(this.email)) {
            this.statusMessage = 'Código de verificación enviado a tu email';
            this.messageType = 'success';
            setTimeout(() => {
              this.step = 'verification';
              this.statusMessage = '';
            }, 1500);
          } else {
            this.statusMessage = 'Email no válido o no registrado';
            this.messageType = 'error';
          }
        } 
        else if (this.step === 'verification') {
          // Validar código de verificación
          if (this.verificationCode.length === 6) {
            this.statusMessage = 'Código verificado correctamente';
            this.messageType = 'success';
            setTimeout(() => {
              this.step = 'new-password';
              this.statusMessage = '';
            }, 1500);
          } else {
            this.statusMessage = 'Código de verificación inválido';
            this.messageType = 'error';
          }
        } 
        else if (this.step === 'new-password') {
          // Actualizar contraseña
          if (this.passwordsMatch) {
            this.statusMessage = 'Contraseña actualizada con éxito';
            this.messageType = 'success';
            setTimeout(() => {
              this.step = 'success';
              // Redireccionar a login después de mostrar mensaje de éxito
              setTimeout(() => {
                this.$router.push('/login');
              }, 2000);
            }, 1500);
          }
        }
      },
      isValidEmail(email) {
        // Validación básica de email
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Mantenemos los estilos base del login y añadimos los específicos para recuperación */
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
    --success-color: #28a745;
    --error-color: #dc3545;
  }
  
  .recover-container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .recover-content {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  @media (max-width: 992px) {
    .recover-content {
      flex-direction: column;
    }
  }
  
  .recover-card, .steps-card {
    background-color: var(--card-background);
    border-radius: 12px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  
  .recover-card {
    flex: 1;
    padding: 2.5rem;
  }
  
  .steps-card {
    flex: 1;
    display: flex;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
  }
  
  .steps-content {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
  }
  
  .recover-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .recover-header h2 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .recover-header p {
    color: var(--text-light);
  }
  
  .recover-form {
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
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    font-size: 1rem;
  }
  
  .form-info {
    color: var(--text-light);
    font-size: 0.85rem;
    margin-top: 0.3rem;
  }
  
  .recover-btn {
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
  
  .recover-btn:hover:not(:disabled) {
    background-color: var(--secondary-color);
    box-shadow: 0 4px 12px rgba(64, 18, 2, 0.3);
  }
  
  .recover-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .back-to-login {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .back-to-login a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
  }
  
  .back-to-login a:hover {
    color: var(--secondary-color);
  }
  
  .steps-card h3 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 0.8rem;
  }
  
  .steps-card h3::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: white;
  }
  
  .steps-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .steps-list li {
    display: flex;
    gap: 1rem;
    opacity: 0.6;
    transition: var(--transition);
  }
  
  .steps-list li.active {
    opacity: 1;
  }
  
  .steps-list li.completed {
    opacity: 0.8;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  .steps-list li.active .step-number {
    background-color: white;
    color: var(--secondary-color);
  }
  
  .steps-list li.completed .step-number {
    background-color: white;
    color: var(--primary-color);
  }
  
  .step-info h4 {
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
  }
  
  .step-info p {
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  .step-security-info {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .step-security-info i {
    font-size: 1.5rem;
  }
  
  .brand-logo {
    margin-top: auto;
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 1px;
  }
  
  /* Estado de verificación de contraseña */
  .password-match {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }
  
  .password-match.match {
    color: var(--success-color);
  }
  
  .password-match.not-match {
    color: var(--error-color);
  }
  
  /* Mensaje de estado */
  .status-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem;
    border-radius: 8px;
    font-size: 0.95rem;
  }
  
  .status-message.success {
    background-color: rgba(40, 167, 69, 0.1);
    color: var(--success-color);
  }
  
  .status-message.error {
    background-color: rgba(220, 53, 69, 0.1);
    color: var(--error-color);
  }
  
  /* Footer Styles */
  .recover-footer {
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
    .recover-card, .steps-card {
      padding: 1.5rem;
    }
    
    .steps-card h3 {
      font-size: 1.5rem;
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