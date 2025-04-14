<template>
  <div>
    <div v-if="isOpen" class="menu-overlay" @click="toggleMenu"></div>

    <button 
      @click="toggleMenu" 
      class="menu-button"
      aria-label="Abrir menú"
    >
      ☰
    </button>

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
      isOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>

<style scoped>
/* 🖤 Fondo overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 900;
}

/* 📌 Botón del menú */
.menu-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
  display: flex;
  align-items: center;
  transition: opacity 0.3s;
}

.menu-button:hover {
  opacity: 0.8;
}

/* 🎨 Contenedor del menú */
.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #250902;
  color: white;
  padding: 20px;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.menu-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-container li {
  position: relative;
  padding: 12px 10px;
  font-size: 17px;
  font-style: italic;
  font-weight: 400;
  text-transform: capitalize;
  transition: all 0.3s ease;
  border-radius: 5px;
}

.menu-container li:hover {
  transform: translateX(10px);
  color: #b38b6d;
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-container a {
  color: white;
  text-decoration: none;
  display: block;
}

/* 🖋️ Estilos de texto y separadores */
.menu-container hr {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 20px 0;
}

.help-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.help-text p {
  margin: 5px 0;
}

/* 📱 Responsive Design */
@media (max-width: 768px) {
  .menu-button {
    font-size: 28px;
    padding: 8px;
    z-index: 1001;
  }
  
  .menu-container {
    width: 85%;
    transition: transform 0.3s ease;
  }

  .menu-container:not(.v-if-active) {
    transform: translateX(-100%);
  }

  .menu-container li {
    padding: 10px 8px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .menu-container {
    width: 90%;
    padding: 15px;
  }
  
  .help-text {
    font-size: 13px;
  }
}
</style>