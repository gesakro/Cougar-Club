<template>
  <div class="app-container">
    <AppNavbar />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter class="site-footer" />
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  name: 'App',
  components: { AppNavbar, AppFooter }
};
</script>

<style>
/* Estilos globales */
html, body {
  width: 100%;
  margin: 0;
  padding: 0;
  /* No usar overflow: hidden */
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-bottom: 2rem; /* Espacio antes del footer */
}

/* Estilos específicos para el footer */
.site-footer {
  position: relative; /* Cambia a 'fixed' si quieres footer pegajoso */
  bottom: 0;
  width: 100%;
  z-index: 100; /* Asegura que esté por encima de otros elementos */
}
</style>