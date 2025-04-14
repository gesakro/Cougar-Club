<template>
  <div class="menu-wrapper">
    <!-- Botón del menú -->
    <button 
      @click="toggleMenu"
      class="menu-button"
      :aria-expanded="isOpen"
      aria-label="Menú principal"
    >
      <span class="menu-icon">{{ isOpen ? '✕' : '☰' }}</span>
    </button>

    <!-- Overlay y menú -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="menu-overlay" 
        @click="toggleMenu"
      ></div>
    </transition>

    <transition name="slide">
      <div 
        v-if="isOpen"
        class="menu-container"
        :class="{ 'desktop-menu': !isMobile }"
      >
        <ul class="menu-list">
          <li v-for="(item, index) in menuItems" :key="index">
            <router-link 
              :to="item.path" 
              @click="toggleMenu"
              class="menu-link"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>

        <div class="menu-footer">
          <p class="help-text">¿Necesitas ayuda?</p>
          <a href="tel:+573123456789" class="contact-link">
            <span class="phone-icon">📞</span>
            +57 312 345 6789
          </a>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "AppMenu",
  data() {
    return {
      isOpen: false,
      isMobile: window.innerWidth < 768,
      menuItems: [
        { label: "Inicio", path: "/" },
        { label: "Nuevos", path: "/new" },
        { label: "Camisetas", path: "/shirts" },
        { label: "Joyeria", path: "/jewelry" },
        { label: "Hombres", path: "/men" },
        { label: "Mujeres", path: "/women" },
        { label: "Accesorios", path: "/accessories" }
      ]
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
      document.body.style.overflow = this.isOpen ? 'hidden' : '';
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
    }
  },
  mounted() {
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {  // <-- Cambiado a beforeUnmount
  window.removeEventListener('resize', this.checkScreenSize);
  document.body.style.overflow = '';
}
};
</script>

<style scoped>
/* === ESTILOS BASE === */
.menu-wrapper {
  position: relative;
  display: inline-block;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.menu-icon {
  font-size: 1.8rem;
  color: white;
  transition: all 0.3s;
}

.menu-button:hover .menu-icon {
  color: #b38b6d;
}

/* === OVERLAY === */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 998;
}

/* === MENÚ PRINCIPAL === */
.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #250902;
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
}

.menu-list {
  list-style: none;
  padding: 1.5rem 0;
  margin: 0;
  flex-grow: 1;
}

.menu-link {
  display: block;
  padding: 0.8rem 1.5rem;
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 400;
  transition: all 0.3s;
  position: relative;
}

.menu-link:hover,
.menu-link.router-link-exact-active {
  color: #b38b6d;
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.menu-link:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #b38b6d;
  transform: scaleY(0);
  transition: transform 0.3s;
}

.menu-link:hover:before,
.menu-link.router-link-exact-active:before {
  transform: scaleY(1);
}

/* === PIE DEL MENÚ === */
.menu-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.help-text {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.contact-link {
  display: flex;
  align-items: center;
  color: #b38b6d;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.3s;
}

.contact-link:hover {
  opacity: 0.8;
}

.phone-icon {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

/* === VERSIÓN DESKTOP === */
.desktop-menu {
  width: 220px; /* Más estrecho para desktop */
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* === ANIMACIONES === */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter, .slide-leave-to {
  transform: translateX(-100%);
}

/* === RESPONSIVE DESIGN === */
@media (min-width: 768px) {
  .menu-button {
    display: none; /* Oculta el botón en desktop */
  }
  
  .menu-container {
    position: relative;
    width: 100%;
    height: auto;
    background: transparent;
    box-shadow: none;
    flex-direction: row;
    align-items: center;
    overflow: visible;
  }
  
  .menu-list {
    display: flex;
    padding: 0;
    gap: 1rem;
  }
  
  .menu-link {
    padding: 0.5rem 1rem;
    font-size: 0.95rem;
  }
  
  .menu-link:hover,
  .menu-link.router-link-exact-active {
    transform: translateY(-3px);
  }
  
  .menu-link:before {
    width: 100%;
    height: 3px;
    top: auto;
    bottom: 0;
    transform: scaleX(0);
  }
  
  .menu-link:hover:before,
  .menu-link.router-link-exact-active:before {
    transform: scaleX(1);
  }
  
  .menu-footer {
    display: none;
  }
}

@media (max-width: 480px) {
  .menu-container {
    width: 85%;
  }
  
  .menu-link {
    padding: 0.7rem 1.2rem;
    font-size: 0.95rem;
  }
}
</style>