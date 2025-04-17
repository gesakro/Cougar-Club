<template>
  <section class="hero-container">
    <div class="hero">
      <img 
        src="@/assets/img/fondo.jpg" 
        alt="Nueva Colección Cougar Club" 
        loading="lazy"
        class="hero-image"
      />
      
      <div class="hero-overlay">
        <h2 class="hero-subtitle">Descubre la Nueva Colección</h2>
        <h1 class="hero-title">Cougar Club</h1>
        
        <button 
          class="hero-cta"
          @click="scrollToProducts"
          aria-label="Ver productos"
        >
          Comprar Ahora
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  methods: {
    scrollToProducts() {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth' 
        });
      } else {
        // Fallback si la sección no existe
        this.$router.push('/products');
      }
    }
  }
};
</script>

<style scoped>
/* Contenedor principal - ajustado */
.hero-container {
  position: relative;
  height: 100vh; /* Aumentamos de 70vh a 90vh */
  min-height: 600px; /* Altura mínima aumentada */
  max-height: 1000px; /* Máximo aumentado */
  width: 100%;
  overflow: hidden;
  background-color: #250902;
}

.hero {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center 30%; /* Ajustamos el recorte vertical */
  filter: brightness(0.7);
  transition: opacity 0.5s ease;
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
}

/* Títulos */
.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  margin: 0.5rem 0;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 400;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
}

/* Botón CTA */
.hero-cta {
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

.hero-cta:hover {
  background-color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-container {
    height: 90vh;
    min-height: 500px;
  }
}

@media (max-width: 480px) {
  .hero-container {
    min-height: 400px;
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
  }
}
</style>