<template>
  <div class="menu-wrapper">

    <!-- Overlay (solo visible en mobile) -->
    <transition name="fade">
      <div 
        v-if="isOpen && isMobile" 
        class="menu-overlay" 
        @click="toggleMenu"
      ></div>
    </transition>

    <!-- Contenedor del menú -->
    <transition :name="isMobile ? 'slide' : 'dropdown'">
      <div 
        v-if="isOpen"
        class="menu-container"
        :class="{ 'mobile-menu': isMobile, 'desktop-menu': !isMobile }"
      >
        <ul class="menu-list">
          <li v-for="(item, index) in menuItems" :key="index">
            <router-link 
              :to="item.path" 
              @click="closeMenu"
              class="menu-link"
              active-class="router-link-exact-active"
            >
              {{ item.label }}
            </router-link>
          </li>
        </ul>

        <!-- Footer del menú (solo mobile) -->
        <div v-if="isMobile" class="menu-footer">
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
      if (this.isMobile) {
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
      }
    },
    closeMenu() {
      this.isOpen = false;
      if (this.isMobile) {
        document.body.style.overflow = '';
      }
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
    }
  },
  mounted() {
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* === ESTILOS BASE === */
.menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
  transition: transform 0.2s;
}

.menu-icon {
  font-size: 1.8rem;
  color: white;
  transition: all 0.3s;
}

.menu-button:hover .menu-icon {
  color: #b38b6d;
  transform: scale(1.1);
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
  z-index: 999;
  background: #250902;
  display: flex;
  flex-direction: column;
}

/* Versión mobile */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
}

/* Versión desktop */
.desktop-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu .menu-list {
  padding: 1.5rem 0;
  flex-grow: 1;
}

.desktop-menu .menu-list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
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

/* Efectos hover y active */
.menu-link:hover,
.menu-link.router-link-exact-active {
  color: #b38b6d;
  background: rgba(255, 255, 255, 0.05);
}

.mobile-menu .menu-link:hover,
.mobile-menu .menu-link.router-link-exact-active {
  transform: translateX(5px);
}

.desktop-menu .menu-link:hover,
.desktop-menu .menu-link.router-link-exact-active {
  transform: translateY(-2px);
}

/* Línea decorativa */
.menu-link:before {
  content: "";
  position: absolute;
  background: #b38b6d;
  transition: transform 0.3s;
}

.mobile-menu .menu-link:before {
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  transform: scaleY(0);
}

.desktop-menu .menu-link:before {
  left: 1.5rem;
  bottom: 0.5rem;
  width: calc(100% - 3rem);
  height: 2px;
  transform: scaleX(0);
}

.menu-link:hover:before,
.menu-link.router-link-exact-active:before {
  transform: scaleY(1);
}

.desktop-menu .menu-link:hover:before,
.desktop-menu .menu-link.router-link-exact-active:before {
  transform: scaleX(1);
}

/* === PIE DEL MENÚ (solo mobile) === */
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

/* === ANIMACIONES === */
/* Fade para overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide para mobile menu */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

/* Dropdown para desktop menu */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* === RESPONSIVE === */
@media (max-width: 480px) {
  .mobile-menu {
    width: 85%;
  }
  
  .menu-link {
    padding: 0.7rem 1.2rem;
  }
}
</style>