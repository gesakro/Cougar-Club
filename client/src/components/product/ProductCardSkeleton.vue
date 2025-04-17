<template>
    <div class="product-card-skeleton">
      <div class="image-placeholder"></div>
      <div class="text-placeholder"></div>
      <div class="price-placeholder"></div>
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .image-placeholder {
    width: 100%;
    height: 180px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  
  .text-placeholder {
    width: 80%;
    height: 16px;
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  .price-placeholder {
    width: 40%;
    height: 14px;
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  </style>