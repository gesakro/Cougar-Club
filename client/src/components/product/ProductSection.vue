<template>
  <div class="product-section">
    <h2 class="section-title">{{ title }}</h2>
    <div class="product-list">
      <ProductCard 
        v-for="product in products" 
        :key="product.id" 
        :product="product"
        @toggle-favorite="$emit('toggle-favorite', $event)"
      />
    </div>
  </div>
</template>

<script>
import ProductCard from './ProductCard.vue'

export default {
  name: 'ProductSection',
  props: {
    title: String,
    products: {
      type: Array,
      default: () => []
    }
  },
  components: {
    ProductCard
  }
}
</script>

<style scoped>
.product-section {
  padding: 1rem;
  margin-bottom: 2rem;
}
.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

@media (min-width: 768px) {
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>