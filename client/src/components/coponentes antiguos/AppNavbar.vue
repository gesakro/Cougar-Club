<template>
  <nav class="navbar">
    <!-- Sección izquierda -->
    <div class="left-section">
      <AppMenu />
      <div class="search-container" :class="{ 'active': searchActive }">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @focus="searchActive = true"
          @blur="searchActive = false"
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
      cartItems: 2 // Ejemplo dinámico
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* === ESTRUCTURA PRINCIPAL === */
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #250902;
  padding: 0.8rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 800;
  height: 60px;
}

/* === SECCIÓN IZQUIERDA === */
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
  font-size: 0.9rem;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.search-icon {
  font-size: 1rem;
  display: flex;
}

/* === LOGO CENTRADO === */
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  justify-self: center;
  white-space: nowrap;
  transition: opacity 0.3s;
}

.logo:hover {
  opacity: 0.9;
}

/* === SECCIÓN DERECHA === */
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

.icon-button:hover {
  transform: scale(1.1);
}

.user-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.cart-counter {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #b38b6d;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === DISEÑO RESPONSIVE === */
@media (max-width: 768px) {
  .navbar {
    grid-template-columns: auto 1fr auto;
    padding: 0.8rem 1rem;
    gap: 10px;
    height: auto;
  }

  .logo {
    font-size: 1.3rem;
    justify-self: start;
    margin-left: 10px;
    order: 1;
  }

  .left-section {
    order: 0;
  }

  .right-section {
    order: 2;
  }

  .search-container {
    grid-column: span 3;
    order: 3;
    width: 100%;
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.8);
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.1rem;
  }

  .left-section,
  .right-section {
    gap: 8px;
  }

  .search-container {
    padding: 0.4rem 0.8rem;
  }

  .user-icon {
    width: 20px;
    height: 20px;
  }
}
</style>