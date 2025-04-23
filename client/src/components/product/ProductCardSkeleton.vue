<template>
  <div class="product-card-skeleton">
    <div class="image-placeholder"></div>
    <div class="info-placeholder">
      <div class="brand-placeholder"></div>
      <div class="name-placeholder"></div>
      <div class="price-placeholder"></div>
      <div class="rating-placeholder"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCardSkeleton'
}
</script>

<style scoped>
.product-card-skeleton {
  width: 100%;
  max-width: 280px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra base */
  transition: all 0.3s ease; /* Para animación consistente */
}

.image-placeholder {
  width: 100%;
  aspect-ratio: 1/1;
  background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px 8px 0 0; /* Bordes redondeados solo arriba */
}

.info-placeholder {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  border-radius: 0 0 8px 8px; /* Bordes redondeados solo abajo */
}

/* Resto de tus estilos permanecen igual... */
.brand-placeholder {
  width: 30%;
  height: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.name-placeholder {
  width: 90%;
  height: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.price-placeholder {
  width: 40%;
  height: 18px;
  background: #f5f5f5;
  border-radius: 4px;
}

.rating-placeholder {
  width: 50%;
  height: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 768px) {
  .product-card-skeleton {
    max-width: 160px;
  }
  
  .info-placeholder {
    padding: 8px;
    gap: 6px;
  }
  
  .name-placeholder {
    height: 14px;
  }
  
  .price-placeholder {
    height: 16px;
  }
}
</style>