<template>
    <div class="home-page"> <!-- Cambia id="app" por una clase local -->
      <AppNavbar />
      <HeroSection />
      <!-- Aquí iría el contenido específico de la página home -->
      <!-- (pero NO <router-view />) -->
    </div>
  </template>
  
  <script>
  import AppNavbar from "@/components/AppNavbar.vue";
  import HeroSection from "@/components/HeroSection.vue";
  
  export default {
    name: 'HomePage',
    components: {
      AppNavbar,
      HeroSection
    }
  };
  </script>
  
  <style scoped> /* Usa "scoped" para estilos locales */
  .home-page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  </style>