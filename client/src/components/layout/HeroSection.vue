<template>
  <section class="hero-container" aria-label="Banner principal de Cougar Club">
    <div class="hero">
      <!-- Imagen con preload y tamaño definido -->
      <img 
        src="@/assets/img/fondo.jpg" 
        alt="Nueva Colección Cougar Club"
        class="hero-image"
        :style="imageStyle"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <div class="hero-overlay">
        <h2 class="hero-subtitle">Descubre la Nueva Colección</h2>
        <h1 class="hero-title">Cougar Club</h1>
        
        <button 
          class="hero-cta"
          @click="scrollToProducts"
          aria-label="Ver productos de la colección"
        >
          Comprar Ahora
          <span class="cta-arrow">→</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  data() {
    return {
      imageLoaded: false
    }
  },
  computed: {
    imageStyle() {
      return {
        opacity: this.imageLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }
    }
  },
  methods: {
    scrollToProducts() {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        this.$router.push({
          path: '/comercios/',
      });
      }
    },
    handleImageLoad() {
      this.imageLoaded = true;
    },
    handleImageError(e) {
      console.error('Error loading hero image', e);
      this.$el.style.background = 'linear-gradient(135deg, #250902 0%, #3a0e03 100%)';
      const img = e.target;
      img.style.display = 'none';
    }
  }
};
</script>

<style scoped>
/* Contenedor principal */
.hero-container {
  position: relative;
  height: 70vh;
  width: 100%;
  max-height: 800px;
  overflow: hidden;
  background-color: #250902; /* Color de fallback */
}

/* Sección hero */
.hero {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Imagen de fondo optimizada */
.hero-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: brightness(0.7);
  will-change: transform; /* Optimización para animaciones */
}

/* Contenido superpuesto */
.hero-overlay {
  position: relative;
  text-align: center;
  color: white;
  padding: 0 1.5rem;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

/* Títulos con animación */
.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 1px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 400;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

/* Botón CTA mejorado */
.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  color: #250902;
  padding: 1rem 2.25rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  border-radius: 50px;
  border: 2px solid transparent;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.hero-cta:hover {
  background-color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  border-color: #250902;
}

.hero-cta:active {
  transform: scale(0.98);
}

.cta-arrow {
  transition: transform 0.3s ease;
}

.hero-cta:hover .cta-arrow {
  transform: translateX(3px);
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 992px) {
  .hero-container {
    height: 65vh;
  }
}

@media (max-width: 768px) {
  .hero-container {
    height: 85vh;
    min-height: 500px;
  }
  
  .hero-overlay {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-container {
    min-height: 400px;
    height: 90vh;
  }

  .hero-image {
    object-position: 60% center;
  }

  .hero-title {
    margin-bottom: 0.75rem;
  }

  .hero-cta {
    width: 90%;
    max-width: 280px;
    padding: 0.9rem 1.5rem;
  }
}

/* Modo oscuro (opcional) */
@media (prefers-color-scheme: dark) {
  .hero-image {
    filter: brightness(0.5);
  }
  
  .hero-cta {
    background-color: rgba(255, 255, 255, 0.95);
  }
}
</style>