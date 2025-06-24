<template>
  <footer class="site-footer">
    <div class="footer-container">
      <!-- Botón principal "Únete a nosotros" - Destacado -->
      <div class="footer-cta-section" v-if="!isLoggedIn">
        <router-link to="/registro-empresa" class="footer-join-btn">
          <span class="btn-icon">🚀</span>
          Únete a nosotros
          <span class="btn-arrow">→</span>
        </router-link>
      </div>

      <!-- Sección de información -->
      <div class="footer-grid">
        <!-- Columna 1: Ayuda y contacto -->
        <div class="footer-column">
          <h3 class="footer-title">Ayuda</h3>
          <ul class="footer-links">
            <li><router-link to="/contact">Contáctanos</router-link></li>
            <li><router-link to="/about">Acerca de Cougar Club</router-link></li>
          </ul>
          <div class="contact-info">
            <p>Número de contacto:</p>
            <a href="tel:+573001234567" class="phone-link">+57 300 123 4567</a>
          </div>
        </div>

        <!-- Columna 2: Servicios -->
        <div class="footer-column">
          <h3 class="footer-title">Servicios</h3>
          <ul class="footer-links">
            <li><router-link to="/shipping">Información de Envío</router-link></li>
            <li><router-link to="/faq">Preguntas Frecuentes</router-link></li>
          </ul>
        </div>
      </div>

      <!-- Sección inferior del footer -->
      <div class="footer-bottom">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} Cougar Club. Todos los derechos reservados.
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted } from 'vue';
export default {
  name: 'AppFooter',
  setup() {
    const isLoggedIn = ref(false);
    const checkLogin = () => {
      isLoggedIn.value = !!localStorage.getItem('token');
    };
    onMounted(() => {
      checkLogin();
      window.addEventListener('storage', checkLogin);
    });
    return { isLoggedIn };
  }
};
</script>

<style scoped>
/* ===== ESTILOS BASE ===== */
.site-footer {
background-color: #250902;
padding: 0;
color: #fff;
width: 100%;
margin-top: 0;
text-align: center;
}

.footer-container {
max-width: 1280px;
margin: 0 auto;
padding: 0 2rem;
}

/* ===== SECCIÓN CTA PRINCIPAL ===== */
.footer-cta-section {
padding: 2.5rem 0 2rem;

border-bottom: 1px solid rgba(179, 139, 109, 0.2);
}

.cta-title {
font-size: 1.6rem;
font-weight: 700;
margin-bottom: 1.5rem;
color: #b38b6d;
text-transform: uppercase;
letter-spacing: 1.5px;
line-height: 1.2;
}

.footer-join-btn {
display: inline-flex;
align-items: center;
gap: 0.8rem;
padding: 1rem 2.5rem;
background: linear-gradient(135deg, #b38b6d 0%, #d4a574 100%);
color: #250902;
text-decoration: none;
border-radius: 50px;
font-size: 1.1rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1.2px;
transition: all 0.4s ease;
box-shadow: 0 6px 20px rgba(179, 139, 109, 0.3);
position: relative;
overflow: hidden;
}

.footer-join-btn::before {
content: '';
position: absolute;
top: 0;
left: -100%;
width: 100%;
height: 100%;
background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
transition: left 0.5s;
}

.footer-join-btn:hover::before {
left: 100%;
}

.footer-join-btn:hover {
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(179, 139, 109, 0.5);
background: linear-gradient(135deg, #d4a574 0%, #e6b885 100%);
}

.btn-icon {
font-size: 1.2rem;
animation: pulse 2s infinite;
}

.btn-arrow {
font-size: 1.2rem;
transition: transform 0.3s ease;
}

.footer-join-btn:hover .btn-arrow {
transform: translateX(5px);
}

@keyframes pulse {
0%, 100% { transform: scale(1); }
50% { transform: scale(1.1); }
}

/* ===== GRID PARA INFORMACIÓN ===== */
.footer-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 2rem;
padding: 2rem 0;
justify-items: center;
}

.footer-column {
max-width: 280px;
width: 100%;
}

/* ===== ELEMENTOS DEL FOOTER ===== */
.footer-title {
font-size: 1.2rem;
font-weight: 600;
margin-bottom: 1.5rem;
color: #b38b6d;
text-transform: uppercase;
letter-spacing: 1.2px;
position: relative;
padding-bottom: 0.8rem;
}

.footer-title::after {
content: "";
position: absolute;
left: 50%;
bottom: 0;
transform: translateX(-50%);
width: 50px;
height: 2px;
background: #b38b6d;
border-radius: 2px;
}

.footer-links {
list-style: none;
padding: 0;
margin: 0;
}

.footer-links li {
margin-bottom: 0.8rem;
}

.footer-links a {
color: #e0e0e0;
text-decoration: none;
transition: all 0.3s ease;
font-size: 0.95rem;
display: inline-block;
}

.footer-links a:hover {
color: #b38b6d;
transform: translateY(-2px);
}

/* ===== INFORMACIÓN DE CONTACTO ===== */
.contact-info {
margin-top: 1.5rem;
padding: 1rem;
background: rgba(179, 139, 109, 0.1);
border-radius: 6px;
border: 1px solid rgba(179, 139, 109, 0.2);
}

.contact-info p {
margin-bottom: 0.6rem;
color: #b38b6d;
font-weight: 600;
font-size: 0.9rem;
}

.phone-link {
color: #fff;
text-decoration: none;
font-size: 1rem;
font-weight: 600;
transition: all 0.3s ease;
}

.phone-link:hover {
color: #b38b6d;
}

/* ===== SECCIÓN INFERIOR ===== */
.footer-bottom {
border-top: 1px solid rgba(179, 139, 109, 0.2);
padding: 1.5rem 0;
display: flex;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
gap: 1rem;
}

.copyright {
color: #b38b6d;
font-size: 0.9rem;
font-weight: 500;
}

.social-links {
display: flex;
gap: 1.5rem;
}

.social-link {
color: #e0e0e0;
text-decoration: none;
transition: all 0.3s ease;
font-size: 0.9rem;
padding: 0.6rem 1rem;
border: 1px solid rgba(179, 139, 109, 0.3);
border-radius: 20px;
background: rgba(179, 139, 109, 0.1);
}

.social-link:hover {
color: #250902;
background: #b38b6d;
transform: translateY(-2px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
.cta-title {
  font-size: 1.4rem;
  padding: 0 1rem;
}

.footer-join-btn {
  font-size: 1rem;
  padding: 0.9rem 2rem;
  gap: 0.6rem;
}

.footer-grid {
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.footer-bottom {
  flex-direction: column;
  text-align: center;
  padding: 1.2rem 0;
}

.social-links {
  justify-content: center;
  flex-wrap: wrap;
}

.footer-cta-section {
  padding: 2rem 0 1.5rem;
}
}

@media (max-width: 480px) {
.cta-title {
  font-size: 1.2rem;
}

.footer-join-btn {
  font-size: 0.9rem;
  padding: 0.8rem 1.8rem;
}

.social-links {
  gap: 1rem;
}

.social-link {
  font-size: 0.8rem;
  padding: 0.5rem 0.8rem;
}

.footer-cta-section {
  padding: 1.5rem 0 1rem;
}
}
</style>