<template>
  <div class="comercios-container">
    <AppNavbar />
    
    <div class="comercios-hero">
      <div class="hero-content">
        <h1>Nuestros Comercios</h1>
        <p>Descubre los mejores establecimientos a tu disposición</p>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" v-model="searchQuery" placeholder="Buscar por nombre, categoría o ubicación..." />
        </div>
      </div>
    </div>
    
    <div class="comercios-content">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando comercios...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchCompanies">Intentar de nuevo</button>
      </div>
      
      <div v-else>
        <div class="filter-controls">
          <div class="filter-tags">
            <button 
              v-for="category in categories" 
              :key="category"
              @click="filterByCategory(category)"
              :class="['category-tag', activeCategory === category ? 'active' : '']"
            >
              {{ category }}
            </button>
          </div>
          <div class="view-toggle">
            <button @click="viewMode = 'grid'" :class="['view-btn', viewMode === 'grid' ? 'active' : '']">
              <i class="fas fa-th"></i>
            </button>
            <button @click="viewMode = 'list'" :class="['view-btn', viewMode === 'list' ? 'active' : '']">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
        
        <div v-if="filteredCompanies.length === 0" class="no-results">
          <i class="fas fa-store-slash"></i>
          <p>No se encontraron comercios con tu búsqueda</p>
          <button class="clear-filters" @click="clearFilters">Limpiar filtros</button>
        </div>
        
        <div v-else :class="['comercios-items', viewMode === 'list' ? 'list-view' : 'grid-view']">
          <div v-for="company in filteredCompanies" :key="company._id" class="comercio-card">
            <div class="card-link" @click="goToCompany(company._id)">
              <div class="card-banner">
                <img
                  v-if="company.imagenBanner"
                  :src="company.imagenBanner"
                  :alt="`Banner de ${company.nombre}`"
                  class="banner-img"
                />
                <div v-else class="banner-placeholder">
                  <i class="fas fa-image"></i>
                </div>
                <div class="category-badge" v-if="company.categoria">
                  <i class="fas fa-tag"></i> {{ company.categoria }}
                </div>
              </div>
              
              <div class="card-content">
                <div class="profile-img-container">
                  <img
                    v-if="company.imagenPerfil"
                    :src="company.imagenPerfil"
                    :alt="`Perfil de ${company.nombre}`"
                    class="profile-img"
                  />
                  <div v-else class="profile-placeholder">
                    <i class="fas fa-store"></i>
                  </div>
                </div>
                
                <div class="company-details">
                  <h3 class="company-name">{{ company.nombre }}</h3>
                  
                  <div class="company-info">
                    <p v-if="company.ubicacion" class="company-location">
                      <i class="fas fa-map-marker-alt"></i> {{ company.ubicacion }}
                    </p>
                    <p class="company-description" v-if="company.descripcion">
                      {{ truncateDescription(company.descripcion) }}
                    </p>
                  </div>
                </div>
                
                <div class="card-action">
                  <span class="view-details">Ver detalles <i class="fas fa-chevron-right"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

export default {
  name: 'ComercioLista',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      companies: [],
      loading: false,
      error: null,
      searchQuery: '',
      activeCategory: 'Todos',
      viewMode: 'grid'
    };
  },
  computed: {
    categories() {
      const categories = ['Todos', ...new Set(
        this.companies
          .filter(company => company.categoria)
          .map(company => company.categoria)
      )];
      return categories;
    },
    filteredCompanies() {
      let filtered = [...this.companies];
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(company => {
          return company.nombre.toLowerCase().includes(query) || 
                 (company.categoria && company.categoria.toLowerCase().includes(query)) ||
                 (company.ubicacion && company.ubicacion.toLowerCase().includes(query));
        });
      }
      
      // Filter by category
      if (this.activeCategory !== 'Todos') {
        filtered = filtered.filter(company => company.categoria === this.activeCategory);
      }
      
      return filtered;
    }
  },
  created() {
    this.fetchCompanies();
  },
  mounted() {
    window.scrollTo(0, 0);
  },
  methods: {
    async fetchCompanies() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('http://localhost:5000/api/companies');
        this.companies = response.data.map(company => ({
          ...company,
          descripcion: company.descripcion || 'Descubre este increíble establecimiento y todo lo que tiene para ofrecer.'
        }));
      } catch (error) {
        console.error("Error fetching companies:", error);
        this.error = "No pudimos cargar los comercios. Por favor intenta de nuevo.";
      } finally {
        this.loading = false;
      }
    },
    filterByCategory(category) {
      this.activeCategory = category;
    },
    clearFilters() {
      this.searchQuery = '';
      this.activeCategory = 'Todos';
    },
    truncateDescription(description) {
      return description.length > 70 ? `${description.substring(0, 70)}...` : description;
    },
    goToCompany(companyId) {
      window.location.href = `/comercios/${companyId}`;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #73614C;
  --primary-light: #a39280;
  --primary-dark: #5a4a38;
  --secondary-color: #401202;
  --accent-color: #D7A461;
  --background-color: #F6F2EB;
  --card-background: #FFFFFF;
  --card-hover: #FCF8F3;
  --text-color: #3E2C1E;
  --text-light: #8B7D70;
  --border-color: #DFD7CE;
  --shadow: 0 8px 20px rgba(115, 97, 76, 0.08);
  --transition: all 0.3s ease;
}

.comercios-container {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Hero Section */
.comercios-hero {
  background: linear-gradient(to right, #73614C, #A39280);
  padding: 3rem 1rem;
  color: white;
  text-align: center;
  position: relative;
}

.comercios-hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to right bottom, transparent 49%, var(--background-color) 50%);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.comercios-hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.comercios-hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.comercios-hero .search-box {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.comercios-hero .search-box input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.comercios-hero .search-box i {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-light);
  font-size: 1.2rem;
}

/* Main Content */
.comercios-content {
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
  flex: 1;
}

/* Filters */
.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-tags {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.category-tag {
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 30px;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
}

.category-tag:hover, .category-tag.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid var(--border-color);
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
}

.view-btn:hover, .view-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Grid and List Views */
.comercios-items {
  margin-top: 1rem;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-view .comercio-card {
  width: 100%;
}

.list-view .card-link {
  flex-direction: row;
  height: 180px;
}

.list-view .card-banner {
  width: 30%;
  height: 100%;
}

.list-view .card-content {
  width: 70%;
  flex-direction: row;
  align-items: center;
}

.list-view .profile-img-container {
  position: static;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.list-view .company-details {
  flex: 1;
}

.list-view .card-action {
  align-self: flex-end;
  margin-left: auto;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(115, 97, 76, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: var(--text-light);
  font-size: 1.1rem;
}

/* Error State */
.error-message {
  background-color: #fff8f8;
  border-left: 4px solid #ff6b6b;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.error-message i {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.error-message p {
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.retry-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.retry-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 0;
}

.no-results i {
  font-size: 4rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.no-results p {
  color: var(--text-light);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.clear-filters {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--transition);
}

.clear-filters:hover {
  background-color: var(--primary-color);
  color: white;
}

/* Card Design */
.comercio-card {
  background-color: var(--card-background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  height: 100%;
  position: relative;
}

.comercio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(115, 97, 76, 0.15);
  background-color: var(--card-hover);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-banner {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.comercio-card:hover .banner-img {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(115, 97, 76, 0.9);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #E6DFD5, #F6F2EB);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-placeholder i {
  font-size: 2.5rem;
  color: #C9BFB3;
}

.card-content {
  padding: 1.8rem;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-img-container {
  position: absolute;
  top: -45px;
  left: 1.8rem;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(115, 97, 76, 0.1);
  border: 4px solid white;
  overflow: hidden;
  z-index: 1;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-placeholder i {
  font-size: 2rem;
  color: white;
}

.company-details {
  margin-top: 2.5rem;
}

.company-name {
  font-size: 1.4rem;
  color: var(--primary-dark);
  font-weight: 600;
  margin-bottom: 0.8rem;
  transition: var(--transition);
}

.comercio-card:hover .company-name {
  color: var(--secondary-color);
}

.company-info {
  color: var(--text-light);
  font-size: 0.95rem;
}

.company-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.company-location i {
  color: var(--accent-color);
}

.company-description {
  line-height: 1.6;
  font-size: 0.9rem;
}

.card-action {
  margin-top: auto;
  text-align: right;
  padding-top: 1.5rem;
}

.view-details {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: var(--transition);
  border-bottom: 1px solid transparent;
  padding-bottom: 0.2rem;
}

.comercio-card:hover .view-details {
  color: var(--secondary-color);
  border-bottom-color: var(--secondary-color);
}

.view-details i {
  font-size: 0.8rem;
  transition: var(--transition);
}

.comercio-card:hover .view-details i {
  transform: translateX(4px);
}

/* Responsive Adjustments */
@media (max-width: 1100px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .list-view .card-link {
    height: auto;
  }
}

@media (max-width: 992px) {
  .comercios-hero h1 {
    font-size: 2.2rem;
  }
  
  .comercios-hero p {
    font-size: 1.1rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .view-toggle {
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .comercios-hero {
    padding: 2.5rem 1rem;
  }
  
  .comercios-hero h1 {
    font-size: 2rem;
  }
  
  .list-view .card-link {
    flex-direction: column;
    height: auto;
  }
  
  .list-view .card-banner {
    width: 100%;
    height: 180px;
  }
  
  .list-view .card-content {
    width: 100%;
    flex-direction: column;
  }
  
  .list-view .profile-img-container {
    position: absolute;
    top: -45px;
    left: 1.8rem;
    margin-right: 0;
  }
  
  .list-view .company-details {
    margin-top: 2.5rem;
  }
  
  .list-view .card-action {
    margin-left: 0;
    margin-top: auto;
    text-align: right;
  }
}

@media (max-width: 576px) {
  .comercios-hero h1 {
    font-size: 1.8rem;
  }
  
  .comercios-hero p {
    font-size: 1rem;
  }
  
  .comercios-hero .search-box input {
    padding: 0.8rem 1rem 0.8rem 2.8rem;
  }
  
  .grid-view {
    grid-template-columns: 1fr;
  }
  
  .category-tag {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
  
  .profile-img-container {
    width: 80px;
    height: 80px;
    top: -40px;
  }
  
  .company-name {
    font-size: 1.3rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
}
</style>