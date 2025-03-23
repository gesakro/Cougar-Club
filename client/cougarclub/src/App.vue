<template>
  <div id="app">
    <AppNavbar />
    <HeroSection />
  </div>
</template>

<script>
import AppNavbar from "./components/AppNavbar.vue";
import HeroSection from "./components/HeroSection.vue";

export default {
  components: {
    AppNavbar,
    HeroSection,
  },
};
</script>

<style>
/* Asegura que toda la pantalla se use correctamente */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Bloquea el scroll en toda la página */
}

/* Ajusta el contenedor principal */
#app {
  width: 100%;
  height: 100vh; /* Ocupará exactamente el alto de la pantalla */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Asegura que nada sobresalga */
}
</style>

