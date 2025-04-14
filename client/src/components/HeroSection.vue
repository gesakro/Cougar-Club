<template>
  <section class="hero">
    <!-- Imagen optimizada con loading lazy -->
    <img 
      src="@/assets/img/fondo.jpg" 
      alt="Nueva Colección Cougar Club" 
      loading="lazy"
      class="hero-image"
    />
    
    <div class="overlay">
      <h2 class="subtitle">Descubre la Nueva Colección</h2>
      <h1 class="title">Cougar Club</h1>
      
      <!-- Botón con feedback táctil -->
      <button 
        class="cta-button"
        @click="scrollToProducts"
        @touchstart="scaleDown"
        @touchend="scaleUp"
        aria-label="Ver productos"
      >
        Comprar Ahora
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  methods: {
    scrollToProducts() {
      document.getElementById('products-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    },
    scaleDown(e) {
      e.currentTarget.style.transform = 'scale(0.95)';
    },
    scaleUp(e) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }
};
</script>

<style scoped>
/* 🖼️ Base del Hero */
.hero {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 70%;
  filter: brightness(0.7);
}

/* 🎨 Overlay de contenido */
.overlay {
  position: relative;
  text-align: center;
  color: white;
  padding: 0 1.5rem;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 400;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
}

/* 🎯 CTA Principal */
.cta-button {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.9);
  color: #250902;
  padding: 1rem 2.25rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cta-button:hover {
  background-color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* 📱 Mobile-First Responsive */
@media (max-width: 768px) {
  .hero {
    height: 85vh;
  }

  .overlay {
    bottom: 15vh;
    padding: 0 1rem;
  }

  .cta-button {
    padding: 0.9rem 2rem;
    margin-top: 1.2rem;
  }
}

@media (max-width: 480px) {
  .hero-image {
    object-position: 60% center;
  }

  .title {
    margin-bottom: 0.75rem;
  }

  .cta-button {
    width: 90%;
    max-width: 280px;
  }
}

/* 🖥️ Pantallas muy anchas */
@media (min-width: 1600px) {
  .hero {
    max-height: 1000px;
  }
}
</style>