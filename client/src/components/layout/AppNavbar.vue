<template>
  <nav class="navbar">
    <!-- Sección izquierda -->
    <div class="left-section">
      <AppMenu />
      <div class="search-container" :class="{ 'active': searchActive, 'mobile-expanded': mobileExpanded }">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @focus="activateSearch"
          @blur="deactivateSearch"
        />
        <button class="search-button" aria-label="Search">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>

    <!-- Logo centrado -->
    <router-link to="/" class="logo">Cougar Club</router-link>

    <!-- Sección derecha -->
    <div class="right-section">
      <button class="icon-button" @click="goToLogin" aria-label="User profile">
        <img src="@/assets/img/user3.png" alt="User" class="user-icon" />
      </button>
      <button class="icon-button cart-button" aria-label="Shopping cart">
        <span class="cart-icon">🛒</span>
        <span class="cart-counter" v-if="cartItems > 0">{{ cartItems }}</span>
      </button>
    </div>
  </nav>
</template>

<script>
import AppMenu from "./AppMenu.vue";

export default {
  name: "NavBar",
  components: { AppMenu },
  data() {
    return {
      searchQuery: "",
      searchActive: false,
      cartItems: 2,
      mobileExpanded: false
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    activateSearch() {
      this.searchActive = true;
      if (window.innerWidth <= 768) {
        this.mobileExpanded = true;
      }
    },
    deactivateSearch() {
      this.searchActive = false;
      this.mobileExpanded = false;
    }
  }
};
</script>

<style scoped>
/* === ESTRUCTURA PRINCIPAL (MANTENIDO) === */
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #250902;
  padding: 0.8rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 800;
  height: 70px; /* Aumentado ligeramente */
}

/* === SECCIÓN IZQUIERDA (MANTENIDO) === */
.left-section {
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 15px;
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  width: 200px;
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0.3rem;
  outline: none;
  font-size: 1rem; /* Aumentado ligeramente */
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.search-icon {
  font-size: 1.2rem; /* Aumentado */
  display: flex;
}

/* === LOGO CENTRADO (MANTENIDO CON AJUSTE) === */
.logo {
  font-size: 3rem; /* Aumentado de 1.5rem */
  font-weight: 700;
  color: white;
  text-decoration: none;
  justify-self: center;
  white-space: nowrap;
  transition: opacity 0.3s;
}

/* === SECCIÓN DERECHA (MANTENIDO CON AJUSTE) === */
.right-section {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 15px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
  transition: transform 0.2s;
}

.user-icon {
  width: 2.5rem; /* Aumentado de 24px */
  height: 2.5rem;
}

.cart-icon {
  font-size: 1.2rem; /* Aumentado */
}

.cart-counter {
  font-size: 0.8rem; /* Aumentado ligeramente */
}

/* === MEJORAS PARA BÚSQUEDA EN MÓVIL === */
@media (max-width: 768px) {
  .navbar {
    grid-template-columns: auto 1fr auto;
    padding: 0.8rem 1rem;
    gap: 10px;
  }

  .search-container {
    width: 40px; /* Solo icono inicialmente */
    justify-content: center;
    padding: 0.5rem;
  }

  .search-container .search-input {
    display: none;
    width: 0;
  }

  .search-container.mobile-expanded {
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: 0.8rem;
    width: auto;
    z-index: 900;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .search-container.mobile-expanded .search-input {
    display: block;
    width: 100%;
    padding: 0.3rem 0.5rem;
  }

  .search-container.mobile-expanded .search-button {
    margin-left: 0;
  }

  .logo {
    font-size: 1.5rem; /* Ajustado para móvil */
    margin-left: 10px;
  }

  .user-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.3rem;
  }
}
</style>