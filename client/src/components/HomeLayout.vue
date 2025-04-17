<template>
    <div class="home-layout">
      <!-- Navbar condicional -->
      <router-view name="navbar" v-if="!$route.meta.hideNavbar" />
      
      <!-- Contenido principal -->
      <main class="main-content">
        <router-view name="hero" v-if="!$route.meta.hideHero" />
        <router-view /> <!-- Para contenido default -->
      </main>
      
      <!-- Footer siempre visible (excepto en login) -->
      <router-view name="footer" v-if="!$route.meta.hideFooter" />
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeLayout'
  }
  </script>
  
  <style scoped>
  .home-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .main-content {
    flex: 1;
  }
  </style>