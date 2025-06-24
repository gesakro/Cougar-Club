<template>
  <div class="products-search-view">
    <AppNavbar />
    
    <SearchOverlay 
      v-if="showSearchOverlay"
      @close="showSearchOverlay = false"
      @search="handleOverlaySearch"
    />
    
    <div class="hero-banner">
      <div class="hero-content">
        <h1>Descubre nuestras colecciones</h1>
        <p>Moda que refleja tu estilo personal</p>
      </div>
    </div>
    
    <main class="search-container">
      <div class="main-search">
        <ProductSearchBar 
          @search="handleSearch"
          v-model="searchQuery"
          @focus="showSearchOverlay = true"
          placeholder="Buscar productos..."
        />
        <button class="mobile-search-btn" @click="showSearchOverlay = true">
          <i class="fas fa-search"></i>
        </button>
      </div>
      
      <div class="search-content">
        <aside class="filters-section">
          <div class="filters-card">
            <h3 class="filters-title">Filtros</h3>
            
            <div class="filters-container">
              <ProductFilters 
                :filters="activeFilters"
                @update-filters="applyFilters"
              />
            </div>
            
            <div class="filters-actions">
              <button class="reset-btn" @click="resetFilters">
                <i class="fas fa-redo-alt"></i> Reiniciar filtros
              </button>
            </div>
          </div>
          
          <ProductSection 
            v-if="trendingProducts.length"
            title="Tendencias" 
            :products="trendingProducts"
            class="sidebar-section trending-sidebar"
          />
        </aside>
        
        <section class="results-section">
          <div class="results-header" v-if="filteredProducts.length > 0">
            <h2 class="results-title">
              {{ filteredProducts.length }} productos encontrados
              <span v-if="searchQuery" class="search-term">para "{{ searchQuery }}"</span>
            </h2>
            
            <div class="sort-control">
              <label for="sortOptions">Ordenar por:</label>
              <select 
                id="sortOptions" 
                v-model="activeFilters.sortBy"
                @change="handleSearch"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>
          </div>
          
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
          
          <div v-else-if="filteredProducts.length > 0" class="products-container">
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
            <button class="accent-btn" @click="resetFilters">Reiniciar filtros</button>
          </div>
          
          <div class="featured-sections">
            <ProductSection 
              v-if="newArrivals.length"
              title="New Arrives" 
              :products="newArrivals"
              class="featured-section"
            />
            
            <ProductSection 
              v-if="bestSellers.length"
              title="Top Sellers" 
              :products="bestSellers"
              class="featured-section"
            />
          </div>
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
      // Redirigir a la página de detalle del producto usando el ID
      this.$router.push(`/product/${product.id}`)
    }
  },
  mounted() {
    this.loadProducts()
  }
}
</script>

<style>
/* Estilos mejorados */
:root {
  --primary: #b38b6d;
  --primary-light: #d5b9a0;
  --primary-dark: #9a735a;
  --primary-lighter: #f0e6dd;
  --primary-darker: #7d5e48;
  --gray-100: #f8f9fa;
  --gray-200: #e9ecef;
  --gray-300: #dee2e6;
  --gray-400: #ced4da;
  --gray-500: #adb5bd;
  --gray-600: #6c757d;
  --gray-700: #495057;
  --gray-800: #343a40;
  --gray-900: #212529;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

/* Base Styles */
.products-search-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f3e8d5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  color: rgb(0, 0, 0);
  text-align: center;
  margin-bottom: 2rem;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%);
  background-size: 60px 60px;
  z-index: 1;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-content h1 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;
}

.hero-content p {
  font-size: 1.3rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  font-weight: 300;
}

.explore-button {
  padding: 0.75rem 2.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.explore-button:hover {
  background-color: white;
  color: var(--primary);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* Main Container */
.search-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 3rem;
  padding: 0 1.5rem;
}

/* Search Bar */
.main-search {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
  transform: translateY(-50%);
}

.mobile-search-btn {
  display: none;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: var(--shadow-md);
}

.mobile-search-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

/* Layout Grid */
.search-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

/* Filters Section */
.filters-section {
  position: sticky;
  top: 1rem;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding-right: 0.5rem;
  scrollbar-width: thin;
}

.filters-section::-webkit-scrollbar {
  width: 4px;
}

.filters-section::-webkit-scrollbar-thumb {
  background-color: var(--primary-light);
  border-radius: 10px;
}

.filters-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary);
}

.filters-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-200);
  text-align: center;
  position: relative;
}

.filters-title:after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--primary);
  border-radius: 2px;
}

.filters-container {
  padding: 0 0.5rem;
}

.filters-actions {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
  text-align: center;
}

/* Estilos para asegurar que las estrellas de calificación estén contenidas */
:deep(.rating-stars) {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  gap: 0.25rem;
}

:deep(.star-icon) {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

:deep(.ratings-filter) {
  overflow: hidden;
  max-width: 100%;
}

:deep(.filter-group) {
  margin-bottom: 1.5rem;
  background-color: var(--primary-lighter);
  border-radius: var(--radius-sm);
  padding: 1rem;
}

:deep(.filter-group h4) {
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: var(--primary-dark);
  font-weight: 600;
}

:deep(.filter-option) {
  margin-bottom: 0.5rem;
}

:deep(.price-range-slider) {
  margin: 1rem 0;
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background-color: var(--primary-light);
  color: white;
}

.sidebar-section {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.trending-sidebar {
  border-top: 3px solid var(--primary);
}

/* Results Section */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(104, 22, 22);
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-800);
}

.search-term {
  font-weight: 400;
  color: var(--primary);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-control label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.sort-control select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: var(--gray-700);
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: var(--gray-600);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Products Container */
.products-container {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.placeholder-icon {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  color: var(--primary);
  opacity: 0.7;
}

.no-results h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.no-results p {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

.accent-btn {
  padding: 0.75rem 2rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: var(--shadow-sm);
}

.accent-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

/* Featured Sections */
.featured-sections {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.featured-section {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .search-content {
    grid-template-columns: 250px 1fr;
  }
  
  .hero-content h1 {
    font-size: 2.25rem;
  }
}

@media (max-width: 992px) {
  .search-content {
    grid-template-columns: 220px 1fr;
  }
  
  .hero-banner {
    padding: 1.5rem 1.5rem;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .search-content {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    position: static;
    height: auto;
    max-height: none;
    padding-right: 0;
  }
  
  .mobile-search-btn {
    display: block;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .sort-control {
    width: 100%;
  }
  
  .sort-control select {
    flex-grow: 1;
  }
  
  .hero-content h1 {
    font-size: 1.75rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .search-container {
    padding: 0 1rem;
  }
  
  .hero-banner {
    padding: 2rem 1rem;
  }
  
  .hero-content h1 {
    font-size: 1.5rem;
  }
  
  .hero-content p {
    font-size: 0.9rem;
  }
  
  .explore-button {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .products-container,
  .featured-section,
  .filters-card,
  .sidebar-section {
    padding: 1rem;
  }
  
  :deep(.filter-group) {
    padding: 0.75rem;
  }
}
</style>