<template>
  <div class="app-container">
    <AppNavbar />
    <div class="main-scroll-container">
      <HeroSection />
      <router-view /> <!-- Tu contenido principal -->
      <AppFooter />
    </div>
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppFooter from '@/components/AppFooter.vue';
import HeroSection from '@/components/HeroSection.vue';

export default {
  name: 'App',
  components: { AppNavbar, AppFooter, HeroSection }
};
</script>

<style>
/* Reset completo */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Elimina scroll global */
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.main-scroll-container {
  flex: 1;
  overflow-y: auto; /* Scroll vertical */
  overflow-x: hidden;
  scroll-behavior: smooth;
  position: relative;
}

/* Personalización de la barra de scroll */
.main-scroll-container::-webkit-scrollbar {
  width: 10px;
}

.main-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-scroll-container::-webkit-scrollbar-thumb {
  background: #b38b6d;
  border-radius: 5px;
}

.main-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9a735a;
}
</style>