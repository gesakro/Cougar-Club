<template>
  <div class="products-search-view">
    <AppNavbar />
    
    <SearchOverlay 
      v-if="showSearchOverlay"
      @close="showSearchOverlay = false"
      @search="handleOverlaySearch"
    />
    
    <main class="search-container">
      <div class="main-search">
        <ProductSearchBar 
          @search="handleSearch"
          v-model="searchQuery"
          @focus="showSearchOverlay = true"
        />
        <button class="mobile-search-btn" @click="showSearchOverlay = true">
          <i class="fas fa-search"></i>
        </button>
      </div>
      
      <div class="search-content">
        <aside class="filters-section">
          <ProductFilters 
            :filters="activeFilters"
            @update-filters="applyFilters"
          />
          
          <ProductSection 
            v-if="trendingProducts.length"
            title="Trending Now" 
            :products="trendingProducts"
            class="sidebar-section"
          />
        </aside>
        
        <section class="results-section">
          <div v-if="filteredProducts.length > 0">
            <ProductGrid 
              :products="paginatedProducts"
              :loading="isLoading"
              @product-click="handleProductClick"
            />
            
            <ProductPagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="changePage"
            />
          </div>
          
          <div v-else class="no-results">
            <div class="placeholder-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#b38b6d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                <path d="M16 16c-1.5-1.5-3.5-2-6-2s-4.5.5-6 2"></path>
              </svg>
            </div>
            <h3>No se encontraron productos</h3>
            <p>Prueba ajustando tu búsqueda o filtros</p>
            <button class="reset-btn" @click="resetFilters">Reiniciar filtros</button>
          </div>
          
          <ProductSection 
            v-if="newArrivals.length"
            title="New Arrivals" 
            :products="newArrivals"
          />
          
          <ProductSection 
            v-if="bestSellers.length"
            title="Best Sellers" 
            :products="bestSellers"
          />
        </section>
      </div>
    </main>
    
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ProductSearchBar from '@/components/product/BarraBusqueda.vue'
import ProductFilters from '@/components/product/ProductFilters.vue'
import ProductGrid from '@/components/product/ProductGrid.vue'
import ProductSection from '@/components/product/ProductSection.vue'
import ProductPagination from '@/components/product/ProductPagination.vue'
import SearchOverlay from '@/components/product/SearchOverlay.vue'



export default {
  name: 'ProductsSearch',
  components: {
    AppNavbar,
    AppFooter,
    ProductSearchBar,
    ProductFilters,
    ProductGrid,
    ProductSection,
    ProductPagination,
    SearchOverlay
  },
  data() {
    return {
      showSearchOverlay: false,
      searchQuery: '',
      activeFilters: {
        category: '',
        priceRange: [0, 1000],
        inStock: false,
        sortBy: 'relevance',
        ratings: null
      },
      allProducts: [
        // Datos de ejemplo para desarrollo
        { 
          id: 1, 
          name: 'Zapatos Deportivos', 
          price: 89.99, 
          category: 'footwear', 
          stock: 10, 
          rating: 4.5,
          isTrending: true,
          isNew: true,
          isBestSeller: true,
          description: 'Zapatos deportivos de alta calidad',
          // En tu ProductsSearch.vue
          image: require('@/assets/img/clothes/zapatilla.jpg')
        },
        { 
          id: 2, 
          name: 'Camiseta Básica', 
          price: 29.99, 
          category: 'clothing', 
          stock: 25, 
          rating: 4.2,
          isTrending: true,
          isNew: false,
          isBestSeller: true,
          description: 'Camiseta 100% algodón',
          image: require('@/assets/img/clothes/CamisaBlanca.jpg')
        },
        { 
          id: 3, 
          name: 'Gorra Ajustable', 
          price: 24.99, 
          category: 'accessories', 
          stock: 15, 
          rating: 3.8,
          isTrending: false,
          isNew: true,
          isBestSeller: false,
          description: 'Gorra con ajuste personalizado',
          image: require('@/assets/img/clothes/gorra.jpg')
        },
        { 
          id: 4, 
          name: 'Pantalón Casual', 
          price: 49.99, 
          category: 'clothing', 
          stock: 0, 
          rating: 4.0,
          isTrending: true,
          isNew: false,
          isBestSeller: true,
          description: 'Pantalón cómodo para uso diario',
          image: require('@/assets/img/clothes/pantalon.jpg')
        },{ 
          id: 5, 
          name: 'Mochila vanguardista', 
          price: 99.99, 
          category: 'clothing', 
          stock: 0, 
          rating: 4.0,
          isTrending: true,
          isNew: false,
          isBestSeller: true,
          description: 'Mochila vanguardista para uso diario',
          image: require('@/assets/img/clothes/bolso.jpg')
        },{ 
          id: 6, 
          name: 'Bolso de mano', 
          price: 19.99, 
          category: 'clothing', 
          stock: 0, 
          rating: 4.0,
          isTrending: true,
          isNew: false,
          isBestSeller: false,
          description: 'Bolso de mano elegante para uso diario',
          image: require('@/assets/img/clothes/bolso_mano_mujer.jpg')
        },{ 
          id: 7, 
          name: 'Bolso de mano', 
          price: 40.99, 
          category: 'clothing', 
          stock: 0, 
          rating: 2.0,
          isTrending: true,
          isNew: false,
          isBestSeller: false,
          description: 'Bolso de mano elegante para uso diario',
          image: require('@/assets/img/clothes/bikini_mujer.jpg')
        },{ 
          id: 8, 
          name: 'Zapatos de charol', 
          price: 40.99, 
          category: 'clothing', 
          stock: 0, 
          rating: 2.0,
          isTrending: true,
          isNew: false,
          isBestSeller: false,
          description: 'Zapatos de charol elegantes para ocasiones especiales',
          image: require('@/assets/img/clothes/zapatos_charol.jpg')
        }
      ],
      filteredProducts: [],
      trendingProducts: [],
      newArrivals: [],
      bestSellers: [],
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 12
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    categories() {
      return [...new Set(this.allProducts.map(p => p.category))]
    }
  },
  methods: {
    loadProducts() {
      this.isLoading = true
      // Simulamos carga con timeout
      setTimeout(() => {
        this.processProductSections()
        this.handleSearch()
        this.isLoading = false
      }, 500)
    },
    processProductSections() {
      this.trendingProducts = this.allProducts
        .filter(p => p.isTrending)
        .slice(0, 4)
      
      this.newArrivals = this.allProducts
        .filter(p => p.isNew)
        .slice(0, 8)
      
      this.bestSellers = this.allProducts
        .filter(p => p.isBestSeller)
        .slice(0, 8)
    },
    handleSearch() {
      this.filteredProducts = this.allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                             product.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        
        const matchesCategory = !this.activeFilters.category || 
                               product.category === this.activeFilters.category
        
        const matchesPrice = product.price >= this.activeFilters.priceRange[0] && 
                            product.price <= this.activeFilters.priceRange[1]
        
        const matchesStock = !this.activeFilters.inStock || product.stock > 0
        
        const matchesRating = !this.activeFilters.ratings || 
                             product.rating >= this.activeFilters.ratings
        
        return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesRating
      })
      
      this.sortProducts()
      this.currentPage = 1
    },
    sortProducts() {
      switch(this.activeFilters.sortBy) {
        case 'price-asc':
          this.filteredProducts.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          this.filteredProducts.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          this.filteredProducts.sort((a, b) => b.rating - a.rating)
          break
        default:
          // Mantener orden por relevancia (por defecto)
          break
      }
    },
    handleOverlaySearch(query) {
      this.searchQuery = query
      this.showSearchOverlay = false
      this.handleSearch()
    },
    applyFilters(newFilters) {
      this.activeFilters = { ...newFilters }
      this.handleSearch()
    },
    resetFilters() {
      this.searchQuery = ''
      this.activeFilters = {
        category: '',
        priceRange: [0, 1000],
        inStock: false,
        sortBy: 'relevance',
        ratings: null
      }
      this.handleSearch()
    },
    changePage(page) {
      this.currentPage = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handleProductClick(product) {
      console.log('Product clicked:', product)
      // Aquí puedes añadir lógica para redirigir o mostrar detalles
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
/* Todos los estilos permanecen igual que en la versión anterior */
.products-search-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.search-container {
  max-width: 1400px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
}

.main-search {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.mobile-search-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
}

.search-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
}

.filters-section {
  position: sticky;
  top: 1rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.sidebar-section {
  margin-top: 2rem;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.placeholder-icon {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  color: #b38b6d;
  opacity: 0.7;
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #b38b6d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-btn:hover {
  background-color: #9a735a;
}

@media (max-width: 992px) {
  .search-content {
    grid-template-columns: 220px 1fr;
  }
}

@media (max-width: 768px) {
  .search-content {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    position: static;
    height: auto;
    padding-right: 0;
  }
  
  .mobile-search-btn {
    display: block;
  }
}
</style>