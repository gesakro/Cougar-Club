<template>
  <nav class="navbar">
    <div class="left-section">
      <AppMenu />
      
      <!-- Barra de búsqueda -->
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
        <button class="search-button">
          🔍
        </button>
      </div>
    </div>

    <div class="logo">Cougar Club</div>

    <div class="right-section">
      <button class="user-button" @click="goToLogin">
        <img src="@/assets/img/user3.png" alt="User Icon" class="user-icon" />
      </button>
      <button class="cart-button">🛒</button>
    </div>
  </nav>
</template>

<script>
import AppMenu from "./AppMenu.vue";

export default {
  name: "NavBar",
  components: {
    AppMenu,
  },
  data() {
    return {
      searchQuery: "", // Estado para la búsqueda
    };
  },
  methods: {
    goToLogin() {
      this.$router.push('/login'); // Navega al login
    }
  }
};
</script>

<style scoped>
/* Estilos de la Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #250902;
  padding: 1px 10px;
  color: white;
}

.left-section {
  display: flex;
  align-items: center;
}

/* Estilo de la barra de búsqueda */
.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 3px 8px;
  height: 18px; /* Reduce la altura de la barra */
  width: 300px; /* Ajusta el ancho */
}

.search-input {
  border: none;
  outline: none;
  padding: 3px;
  width: 200px;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-left: 115px;
}

/* Resto del navbar */
.logo {
  font-size: 24px;
  font-weight: bold;
}

.right-section {
  display: flex;
  align-items: center;
}

.user-button, .cart-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 15px;
}

.user-icon {
  width: 20px;
}

.cart-button {
  font-size: 20px;
}
</style>
