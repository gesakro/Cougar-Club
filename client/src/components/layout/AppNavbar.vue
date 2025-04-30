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
        <router-link to="/cart" class="cart-link">🛒</router-link>
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
/* === ESTRUCTURA PRINCIPAL (CORREGIDA) === */
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #250902;
  padding: 0.8rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 800;
  min-height: 70px; /* Cambiado de height fijo a min-height */
  width: 100%; /* Asegura que ocupe todo el ancho disponible */
  box-sizing: border-box; /* Para que padding no afecte el ancho total */
}

/* === SECCIÓN IZQUIERDA (AJUSTADA) === */
.left-section {
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 15px;
  flex-shrink: 1; /* Permite que se contraiga si es necesario */
  min-width: 0; /* Evita que crezca más allá de su espacio asignado */
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  width: 200px;
  max-width: 100%; /* Evita desbordamiento */
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0.3rem;
  outline: none;
  font-size: 1rem;
  text-overflow: ellipsis; /* Muestra "..." si el texto no cabe */
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
  flex-shrink: 0; /* Evita que el botón se reduzca */
}

.search-icon {
  font-size: 1.2rem;
  display: flex;
}

/* === LOGO CENTRADO (AJUSTADO) === */
.logo {
  font-size: 2.2rem; /* Tamaño más moderado que 3rem */
  font-weight: 700;
  color: white;
  text-decoration: none;
  justify-self: center;
  white-space: nowrap;
  transition: opacity 0.3s;
  overflow: hidden; /* Previene desbordamiento */
  text-overflow: ellipsis; /* Muestra "..." si es necesario */
}

/* === SECCIÓN DERECHA (AJUSTADA) === */
.right-section {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 15px;
  flex-shrink: 0; /* Mantiene su tamaño */
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
  transition: transform 0.2s;
  display: flex; /* Mejor alineación */
  align-items: center;
  justify-content: center;
}

.user-icon {
  width: 2rem; /* Reducido ligeramente para mejor equilibrio */
  height: 2rem;
  object-fit: contain; /* Mantiene proporciones */
}

.cart-link {
  text-decoration: none;
  font-size: 1.2rem;
  display: flex;
}

.cart-counter {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
    transition: all 0.3s ease;
  }

  .search-container .search-input {
    display: none;
    width: 0;
    transition: width 0.3s ease;
  }

  .search-container.mobile-expanded {
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: 15px; /* Ajustado para centrarlo mejor */
    width: calc(100% - 2rem); /* Ancho controlado */
    max-width: 100%;
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
    max-width: 120px; /* Previene que ocupe demasiado espacio */
    text-align: center;
  }

  .left-section {
    max-width: 30%; /* Limita el ancho en móvil */
  }

  .right-section {
    max-width: 30%; /* Limita el ancho en móvil */
  }

  .user-icon {
    width: 24px;
    height: 24px;
  }
}

/* Ajuste adicional para pantallas muy pequeñas */
@media (max-width: 480px) {
  .navbar {
    padding: 0.8rem 0.5rem; /* Reduce el padding horizontal */
  }
  
  .logo {
    font-size: 1.2rem;
    max-width: 100px;
  }
  
  .icon-button {
    padding: 0.3rem; /* Reduce el padding */
  }
  
  .left-section, 
  .right-section {
    gap: 8px; /* Reduce el espacio entre elementos */
  }
}
</style>