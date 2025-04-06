<template>
  <div>
    <div v-if="isOpen" class="menu-overlay" @click="toggleMenu"></div>

    <button @click="toggleMenu" class="menu-button">☰</button>

    <div v-if="isOpen" class="menu-container">
      <ul>
        <li><router-link to="/" @click="toggleMenu">Home</router-link></li>
        <li><a href="#">New</a></li>
        <li><a href="#">Shirts</a></li>
        <li><a href="#">Jewelry</a></li>
        <li><a href="#">Men</a></li>
        <li><a href="#">Women</a></li>
        <li><a href="#">Accessories</a></li>
      </ul>

      <hr />

      <div class="help-text">
        <p>Can we help you?</p>
        <p>+57 XXXXXXXXXX</p>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      isOpen: false, // Estado del menú
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen; // Alterna el estado
    },
  },
};
</script>

<style>
/* 🖤 Fondo gris al abrir el menú */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Fondo oscuro semitransparente */
  backdrop-filter: blur(3px); /* Opcional: efecto borroso */
  z-index: 900;
}

/* 📌 Estilo del menú */
.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #250902; /* Color oscuro similar al de la imagen */
  color: white;
  padding: 20px;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
}

.menu-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Ahora el hover debería funcionar */
.menu-container li {
  position: relative;
  padding: 10px;
  font-size: 17px;
  font-style: italic;
  font-weight: 400;
  text-transform: capitalize;
  transition: transform 0.3s ease-in-out, color 0.3s ease-in-out;
  border-radius: 5px;
}

.menu-container li:hover {
  transform: translateX(10px); /* Se desliza a la derecha */
  color: #b38b6d; /* Cambia a color dorado/marrón */
  background-color: rgba(255, 255, 255, 0.1) !important;
}


.menu-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
}

</style>
