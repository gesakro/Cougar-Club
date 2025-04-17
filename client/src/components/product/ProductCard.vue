<template>
    <div class="product-card">
      <div class="product-image">
        <img :src="product.image || 'https://via.placeholder.com/100x120'" :alt="product.name" />
        <button class="like-btn" @click="toggleLike">❤️</button>
      </div>
      <p class="product-name">{{ product.name }}</p>
      <div class="product-price">
        <strong>${{ product.price }}</strong>
        <span v-if="product.originalPrice" class="original-price">${{ product.originalPrice }}</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductCard',
    props: {
      product: {
        type: Object,
        required: true,
        default: () => ({
          id: '',
          name: 'Product Name',
          price: 0,
          image: ''
        })
      }
    },
    methods: {
      toggleLike() {
        this.$emit('toggle-favorite', this.product.id)
      }
    }
  }
  </script>
  
  <style scoped>
  .product-card {
    width: 150px;
    text-align: center;
    margin: 0.5rem;
    transition: transform 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-5px);
  }
  .product-image {
    position: relative;
    margin-bottom: 0.5rem;
  }
  .like-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(255,255,255,0.7);
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  .product-name {
    font-size: 0.9rem;
    margin: 0.3rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .product-price {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
  .original-price {
    text-decoration: line-through;
    color: #999;
    font-size: 0.8rem;
  }
  </style>