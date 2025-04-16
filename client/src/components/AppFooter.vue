<template>
    <footer class="site-footer">
      <div class="footer-container">
        <!-- Sección superior del footer -->
        <div class="footer-grid">
          <!-- Columna 1: Ayuda y contacto -->
          <div class="footer-column">
            <h3 class="footer-title">Help</h3>
            <ul class="footer-links">
              <li><a href="#">Sumiona</a></li>
              <li><a href="#">About Cougar Club</a></li>
              <li><a href="#">Email Sign-up</a></li>
            </ul>
            <div class="contact-info">
              <p>Numero de contacto:</p>
              <a href="tel:rttl" class="phone-link">rttl</a>
            </div>
          </div>
  
          <!-- Columna 2: Servicios -->
          <div class="footer-column">
            <h3 class="footer-title">Services</h3>
            <ul class="footer-links">
              <li><a href="#">Service 1</a></li>
              <li><a href="#">Art & Culture</a></li>
              <li><a href="#">Service 2</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Product Core</a></li>
            </ul>
          </div>
  
          <!-- Columna 3: Newsletter -->
          <div class="footer-column newsletter-column">
            <h3 class="footer-title">Cougar Club Updates</h3>
            <p class="newsletter-text">
              Sign up for Cougar club emails and receive the interviews from us, including exclusive online phone launches and new collections
            </p>
            <form class="newsletter-form">
              <input 
                type="email" 
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
    // Lógica adicional si es necesaria
  }
  </script>
  
  <style scoped>
  /* ================= ESTILOS BASE ================= */
  .site-footer {
    background-color: #250902;
    color: #fff;
    padding: 4rem 0 0; /* Más padding superior */
    font-family: 'Arial', sans-serif;
    width: 100%;
    margin-top: auto; /* Crucial para fijar al fondo */
    position: relative;
    z-index: 100;
  }
  
  .footer-container {
    max-width: 1280px; /* Más ancho para desktop */
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  /* ================= GRID PARA DESKTOP ================= */
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columnas fijas en desktop */
    gap: 3rem; /* Más espacio entre columnas */
    margin-bottom: 3rem;
  }
  
  .footer-column {
    padding: 0 1.5rem;
  }
  
  .newsletter-column {
    grid-column: span 1; /* Asegura que ocupe una columna */
  }
  
  /* ================= ELEMENTOS DEL FOOTER ================= */
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
    display: inline-block;
    position: relative;
  }
  
  .footer-links a:hover {
    color: #b38b6d;
    transform: translateX(5px);
  }
  
  /* ================= NEWSLETTER ================= */
  .newsletter-text {
    color: #ccc;
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 2rem;
  }
  
  .newsletter-form {
    display: flex;
    gap: 0.8rem;
  }
  
  .email-input {
    flex: 1;
    min-width: 200px;
    padding: 0.9rem 1.2rem;
    border: 1px solid #444;
    background: #1a0400;
    color: #fff;
    border-radius: 4px;
    font-size: 0.95rem;
    transition: border 0.3s;
  }
  
  .email-input:focus {
    outline: none;
    border-color: #b38b6d;
  }
  
  .subscribe-btn {
    padding: 0.9rem 2rem;
    background: #b38b6d;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .subscribe-btn:hover {
    background: #9a735a;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  /* ================= SECCIÓN INFERIOR ================= */
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 2rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3rem;
  }
  
  .copyright {
    color: #888;
    font-size: 0.9rem;
  }
  
  .social-links {
    display: flex;
    gap: 1.8rem;
  }
  
  .social-links a {
    color: #ddd;
    text-decoration: none;
    transition: all 0.3s;
    font-size: 1.1rem;
  }
  
  .social-links a:hover {
    color: #b38b6d;
    transform: scale(1.1);
  }
  
  /* ================= RESPONSIVE ================= */
  @media (max-width: 1024px) {
    .footer-container {
      max-width: 100%;
      padding: 0 3rem;
    }
  }
  
  @media (max-width: 768px) {
    .footer-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    
    .footer-column {
      padding: 0;
    }
    
    .footer-bottom {
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
      padding: 1.5rem 0;
    }
    
    .newsletter-form {
      flex-direction: column;
    }
  }
  
  @media (max-width: 480px) {
    .footer-container {
      padding: 0 1.5rem;
    }
    
    .site-footer {
      padding: 3rem 0 0;
    }
  }
  </style>