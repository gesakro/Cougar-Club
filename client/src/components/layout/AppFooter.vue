<template>
    <footer class="site-footer">
      <div class="footer-container">
        <!-- Sección superior del footer -->
        <div class="footer-grid">
          <!-- Columna 1: Ayuda y contacto -->
          <div class="footer-column">
            <h3 class="footer-title">Help</h3>
            <ul class="footer-links">
              <li><router-link to="/contact">Contact Us</router-link></li>
              <li><router-link to="/about">About Cougar Club</router-link></li>
              <li><router-link to="/newsletter">Email Sign-up</router-link></li>
            </ul>
            <div class="contact-info">
              <p>Contact number:</p>
              <a href="tel:+573001234567" class="phone-link">+57 300 123 4567</a>
            </div>
          </div>
  
          <!-- Columna 2: Servicios -->
          <div class="footer-column">
            <h3 class="footer-title">Services</h3>
            <ul class="footer-links">
              <li><router-link to="/shipping">Shipping Info</router-link></li>
              <li><router-link to="/returns">Returns Policy</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
            </ul>
          </div>
  
          <!-- Columna 3: Newsletter -->
          <div class="footer-column newsletter-column">
            <h3 class="footer-title">Cougar Club Updates</h3>
            <p class="newsletter-text">
              Sign up for Cougar club emails to receive exclusive offers and new collection announcements
            </p>
            <form class="newsletter-form" @submit.prevent="handleSubscribe">
              <input 
                type="email" 
                v-model="email"
                placeholder="Your email address" 
                required
                class="email-input"
              >
              <button type="submit" class="subscribe-btn">Subscribe</button>
            </form>
          </div>
        </div>
  
        <!-- Sección inferior del footer -->
        <div class="footer-bottom">
          <div class="copyright">
            &copy; {{ new Date().getFullYear() }} Cougar Club. All rights reserved.
          </div>
          <div class="social-links">
            <a href="#" aria-label="Instagram"><span>IG</span></a>
            <a href="#" aria-label="Facebook"><span>FB</span></a>
            <a href="#" aria-label="Twitter"><span>TW</span></a>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'AppFooter',
    data() {
      return {
        email: ''
      }
    },
    methods: {
      handleSubscribe() {
        console.log('Subscribed with:', this.email);
        this.email = '';
      }
    }
  };
  </script>
  
  <style scoped>
  /* ===== ESTILOS BASE SIN MÁRGENES SUPERIORES ===== */
  .site-footer {
    background-color: #250902;
    padding: 2rem 0;
    color: #fff;
    padding: 4rem 0 0;
    width: 100%;
    margin-top: 0; /* Eliminamos cualquier margen superior */
  }
  
  .footer-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* ===== GRID PARA DESKTOP ===== */
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .footer-column {
    padding: 0 1.5rem;
  }
  
  /* ===== ELEMENTOS DEL FOOTER ===== */
  .footer-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1.8rem;
    color: #b38b6d;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    position: relative;
    padding-bottom: 0.8rem;
  }
  
  .footer-title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50px;
    height: 2px;
    background: #b38b6d;
  }
  
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .footer-links li {
    margin-bottom: 1rem;
  }
  
  .footer-links a {
    color: #e0e0e0;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 1rem;
  }
  
  .footer-links a:hover {
    color: #b38b6d;
  }
  
  /* ===== NEWSLETTER ===== */
  .newsletter-form {
    display: flex;
    gap: 0.8rem;
  }
  
  .email-input {
    flex: 1;
    padding: 0.9rem 1.2rem;
    border: 1px solid #444;
    background: #1a0400;
    color: #fff;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  .subscribe-btn {
    padding: 0.9rem 2rem;
    background: #b38b6d;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* ===== SECCIÓN INFERIOR ===== */
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .social-links {
    display: flex;
    gap: 1.8rem;
  }
  
  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr;
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .newsletter-form {
      flex-direction: column;
    }
  }
  </style>