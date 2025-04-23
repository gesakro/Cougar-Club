<template>
    <div class="product-filters">
      <div class="filter-group">
        <h3 class="filter-title">Sort By</h3>
        <select v-model="localFilters.sortBy" class="filter-select">
          <option value="relevance">Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
  
      <div class="filter-group">
        <h3 class="filter-title">Categories</h3>
        <div class="filter-options">
          <label 
            v-for="category in categories" 
            :key="category"
            class="filter-option"
          >
            <input 
              type="radio" 
              v-model="localFilters.category" 
              :value="category"
              @change="applyFilters"
            >
            <span>{{ category }}</span>
          </label>
        </div>
      </div>
  
      <div class="filter-group">
        <h3 class="filter-title">Price Range</h3>
        <div class="price-range">
          <span>${{ localFilters.priceRange[0] }}</span>
          <input 
            type="range" 
            v-model="localFilters.priceRange[1]" 
            :min="minPrice"
            :max="maxPrice"
            @change="applyFilters"
            class="price-slider"
          >
          <span>${{ localFilters.priceRange[1] }}</span>
        </div>
      </div>
  
      <div class="filter-group">
        <h3 class="filter-title">Customer Rating</h3>
        <div class="rating-stars">
          <button
            v-for="rating in 5"
            :key="rating"
            @click="setRating(6 - rating)"
            :class="{ 'active': localFilters.ratings === (6 - rating) }"
          >
            ★{{ 6 - rating }}+
          </button>
        </div>
      </div>
  
      <div class="filter-group">
        <label class="filter-checkbox">
          <input 
            type="checkbox" 
            v-model="localFilters.inStock"
            @change="applyFilters"
          >
          <span>In Stock Only</span>
        </label>
      </div>
  
      <button class="apply-filters" @click="applyFilters">
        Apply Filters
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductFilters',
    props: {
      filters: {
        type: Object,
        required: true
      },
      categories: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        localFilters: { ...this.filters },
        minPrice: 0,
        maxPrice: 1000
      }
    },
    methods: {
      applyFilters() {
        this.$emit('update-filters', { ...this.localFilters })
      },
      setRating(rating) {
        this.localFilters.ratings = this.localFilters.ratings === rating ? null : rating
        this.applyFilters()
      }
    },
    watch: {
      filters: {
        deep: true,
        handler(newVal) {
          this.localFilters = { ...newVal }
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .product-filters {
    background: white;
    padding: 1.2rem 1rem; 
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    width: 230px;

  }
  
  .filter-group {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
  }
  
  .filter-group:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .filter-title {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    color: #333;
  }
  
  .filter-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
  }
  
  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .filter-option span {
    font-size: 0.9rem;
  }
  
  .price-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

.price-range span {
  min-width: 45px; /* Asegurar un ancho mínimo para los valores */
  font-size: 0.9rem; /* Reducir ligeramente el tamaño de fuente */
}
  
  .price-slider {
    flex-grow: 1;
    height: 6px;
    cursor: pointer;
  }
  
  .rating-stars {
  display: flex;
  flex-wrap: wrap; /* Permite que los botones se envuelvan en múltiples líneas */
  gap: 0.4rem; /* Reduce el espacio entre botones */
  justify-content: space-between; /* Distribuye los botones uniformemente */
  }
  
  .rating-stars button {
    padding: 0.3rem 0.6rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .rating-stars button.active {
    background: #ffd700;
    border-color: #ffd700;
    color: #333;
  }
  
  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .apply-filters {
    width: 100%;
    padding: 0.7rem;
    background-color: #b38b6d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  }
  
  .apply-filters:hover {
    background-color: #9a735a;
  }
  
  @media (max-width: 768px) {
    .product-filters {
      padding: 1rem;
    }
  }
  </style>