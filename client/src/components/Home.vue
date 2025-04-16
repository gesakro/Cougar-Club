<template>
  <main class="home-page">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Sección de Servicios -->
    <!----<ServicesSection id="services-section" -->

    <!-- Otras secciones de la landing page -->
    <!-- <FeaturedProducts /> -->
    <!-- <Testimonials /> -->
    <!-- <NewsletterSignup /> -->
  </main>
</template>

<script>
import HeroSection from '@/components/HeroSection.vue';
//import ServicesSection from '@/components/ServicesSection.vue';

export default {
  name: 'HomeView',
  components: {
    HeroSection
    //ServicesSection
  },
  // Opcional: Métodos para scroll/animation
  methods: {
    handleScroll() {
      // Lógica para efectos al hacer scroll
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.home-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* No necesita height: 100vh (lo maneja App.vue) */
}

/* Transición suave entre secciones */
section {
  scroll-margin-top: 80px; /* Ajusta según altura de tu navbar */
}

/* Efecto de scroll snapping (opcional) */
@media (min-width: 1024px) {
  .home-page {
    scroll-snap-type: y proximity;
  }
  section {
    scroll-snap-align: start;
  }
}
</style>