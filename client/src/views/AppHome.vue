<template>
  <div class="landing-page">
    <!-- Navbar -->
    <AppNavbar />
    
    <!-- Hero Section (contenido principal) -->
    <HeroSection />
    
    <!-- Otras secciones aquí -->
    <!-- <FeaturesSection /> -->
    <!-- <TestimonialsSection /> -->
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HeroSection from '@/components/layout/HeroSection.vue'

export default {
  name: 'AppHome',
  components: {
    AppNavbar,
    AppFooter,
    HeroSection
  }
}
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>