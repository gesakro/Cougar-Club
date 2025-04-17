<template>
  <div class="minimal-layout">
    <HeroSection />
    <AppFooter />
  </div>
</template>

<script>
import HeroSection from '@/components/HeroSection.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  name: 'HomeView',
  components: {
    HeroSection,
    AppFooter
  }
};
</script>

<style scoped>
.minimal-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}
</style>