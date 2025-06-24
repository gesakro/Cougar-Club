<template>
  <div class="product-card" @click="handleCardClick">
    <div class="product-image">
      <img 
        :src="product.image || fallbackImage" 
        :alt="product.name" 
        @error="handleImageError"
      />
      <div v-if="product.discount" class="discount-badge">
        -{{ product.discount }}%
      </div>
    </div>
    <div class="product-info">
      <p class="product-name">{{ product.name }}</p>
      <div class="product-price">
        <strong>{{ formattedPrice }}</strong>
        <span v-if="product.originalPrice" class="original-price">
          {{ formattedOriginalPrice }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import PriceService from '@/services/PriceService';

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
        originalPrice: null,
        image: '',
        brand: '',
        discount: null,
        rating: null,
        reviewCount: null,
        isLiked: false
      })
    }
  },
  data() {
    return {
      fallbackImage: 'https://via.placeholder.com/300x300?text=No+Image',
      imageError: false
    }
  },
  computed: {
    formattedPrice() {
      return PriceService.formatPrice(this.product.price);
    },
    formattedOriginalPrice() {
      return this.product.originalPrice ? PriceService.formatPrice(this.product.originalPrice) : '';
    }
  },
  methods: {
    handleCardClick() {
      this.$emit('card-click', this.product);
    },
    toggleLike() {
      this.$emit('toggle-favorite', this.product.id)
    },
    handleImageError() {
      this.imageError = true
    }
  }
}
</script>

<style scoped>
.product-card {
  width: 100%;
  max-width: 280px;
  text-align: left;
  margin: 0.5rem;
  transition: transform 0.3s ease;
  position: relative;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  margin-bottom: 0.5rem;
  aspect-ratio: 1/1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.like-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  z-index: 2;
}

.like-btn.liked {
  color: red;
}

.like-btn:hover {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff4444;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
}

.product-info {
  padding: 0.5rem;
}

.product-brand {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.product-name {
  font-size: 0.9rem;
  margin: 0.3rem 0;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  -ms-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  -ms-box-orient: vertical;
  box-orient: vertical;
  min-height: 2.5em;
}
.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.product-price strong {
  color: #333;
  font-size: 1rem;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .product-card {
    max-width: 160px;
  }
  
  .product-name {
    font-size: 0.8rem;
  }
  
  .product-price strong {
    font-size: 0.9rem;
  }
}
</style>