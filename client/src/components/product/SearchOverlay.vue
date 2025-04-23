<template>
    <div class="search-overlay">
      <header class="overlay-header">
        <h1 class="logo">Cougar Club</h1>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>
  
      <SearchBar @search="handleSearch" />
  
      <section v-if="trendingSearches.length" class="trending">
        <p class="section-label">TRENDING SEARCHES</p>
        <div class="tags">
          <span 
            v-for="(tag, index) in trendingSearches" 
            :key="index"
            @click="searchTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </section>
  
      <ProductSection 
        v-if="newProducts.length"
        title="New this season" 
        :products="newProducts"
      />
      
      <ProductSection 
        v-if="bestSellers.length"
        title="Best Sellers" 
        :products="bestSellers"
      />
  
      <footer class="overlay-footer">
        <p>Customer Service Available on +57 XXXXXXXX <a href="#">FAQs</a></p>
      </footer>
    </div>
  </template>
  
  <script>
  import SearchBar from '@/components/product/BarraBusqueda.vue'
  import ProductSection from '@/components/product/ProductSection.vue'
  
  export default {
    name: 'SearchOverlay',
    components: {
      SearchBar,
      ProductSection
    },
    data() {
      return {
        trendingSearches: ['Murakami', 'Jewelry', 'Shirts', 'Black'],
        newProducts: [],
        bestSellers: []
      }
    },
    methods: {
      handleSearch(query) {
        // Implementar búsqueda real
        console.log('Searching for:', query)
      },
      searchTag(tag) {
        this.handleSearch(tag)
      }
    }
  }
  </script>
  
  <style scoped>
  .search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1000;
    padding: 1rem;
    overflow-y: auto;
  }
  .overlay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .logo {
    font-size: 1.5rem;
    color: #b38b6d;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .section-label {
    color: #666;
    font-size: 0.8rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .tags span {
    background: #f5f5f5;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    cursor: pointer;
    transition: background 0.3s;
  }
  .tags span:hover {
    background: #e0e0e0;
  }
  .overlay-footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }
  </style>