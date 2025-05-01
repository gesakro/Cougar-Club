<template>
    <div class="product-grid">
      <div v-if="loading" class="loading-grid">
        <ProductCardSkeleton v-for="n in 12" :key="n" />
      </div>
      
      <template v-else>
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :product="product"
          @click="$emit('product-click', product)"
        />
      </template>
    </div>
  </template>
  
  <script>
  import ProductCard from '@/components/product/ProductCard.vue'
  import ProductCardSkeleton from '@/components/product/ProductCardSkeleton.vue'
  
  export default {
    name: 'ProductGrid',
    components: {
      ProductCard,
      ProductCardSkeleton
    },
    props: {
      products: {
        type: Array,
        required: true,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  
  <style scoped>
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }
  }
  </style>