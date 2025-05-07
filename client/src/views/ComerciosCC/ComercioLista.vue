<template>
  <div class="comercios-container">
    <AppNavbar />
    
    <div class="comercios-content">
      <div class="comercios-header">
        <h1>Nuestros Comercios</h1>
        <p>Descubre los mejores establecimientos a tu disposición</p>
      </div>
      
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
        <div class="filter-container">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" v-model="searchQuery" placeholder="Buscar comercios..." />
          </div>
        </div>
        
        <div v-if="filteredCompanies.length === 0" class="no-results">
          <i class="fas fa-store-slash"></i>
          <p>No se encontraron comercios con tu búsqueda</p>
        </div>
        
        <div v-else class="comercios-grid">
          <div v-for="company in filteredCompanies" :key="company._id" class="comercio-card">
            <router-link :to="`/comercios/${company._id}`" class="card-link">
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
                
                <h3 class="company-name">{{ company.nombre }}</h3>
                
                <div class="company-info">
                  <p v-if="company.categoria" class="company-category">
                    <i class="fas fa-tag"></i> {{ company.categoria }}
                  </p>
                  <p v-if="company.ubicacion" class="company-location">
                    <i class="fas fa-map-marker-alt"></i> {{ company.ubicacion }}
                  </p>
                </div>
                
                <div class="card-action">
                  <span class="view-details">Ver detalles <i class="fas fa-chevron-right"></i></span>
                </div>
              </div>
            </router-link>
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
      searchQuery: ''
    };
  },
  computed: {
    filteredCompanies() {
      if (!this.searchQuery) return this.companies;
      
      const query = this.searchQuery.toLowerCase();
      return this.companies.filter(company => {
        return company.nombre.toLowerCase().includes(query) || 
               (company.categoria && company.categoria.toLowerCase().includes(query)) ||
               (company.ubicacion && company.ubicacion.toLowerCase().includes(query));
      });
    }
  },
  created() {
    this.fetchCompanies();
  },
  methods: {
    async fetchCompanies() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get('http://localhost:5000/api/companies');
        this.companies = response.data;
      } catch (error) {
        console.error("Error fetching companies:", error);
        this.error = "No pudimos cargar los comercios. Por favor intenta de nuevo.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  --primary-color: #73614C;
  --secondary-color: #401202;
  --accent-color: #ff6b6b;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --text-color: #333333;
  --text-light: #777777;
  --border-color: #e1e5ea;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
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

.comercios-content {
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
  flex: 1;
}

.comercios-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.comercios-header h1 {
  font-size: 2.2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.comercios-header p {
  color: var(--text-light);
  font-size: 1.1rem;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(115, 97, 76, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
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
  background-color: #fff1f0;
  border-left: 4px solid #ff4d4f;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  margin: 2rem 0;
}

.error-message i {
  font-size: 2.5rem;
  color: #ff4d4f;
  margin-bottom: 1rem;
}

.error-message p {
  margin-bottom: 1rem;
  color: #5c5c5c;
}

.retry-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.retry-btn:hover {
  background-color: var(--secondary-color);
}

/* Filter Container */
.filter-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(115, 97, 76, 0.2);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 3rem 0;
}

.no-results i {
  font-size: 3rem;
  color: var(--text-light);
  margin-bottom: 1rem;
}

.no-results p {
  color: var(--text-light);
  font-size: 1.1rem;
}

/* Comercios Grid */
.comercios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.comercio-card {
  background-color: var(--card-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  height: 100%;
}

.comercio-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
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
  height: 160px;
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

.banner-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-placeholder i {
  font-size: 2rem;
  color: #cccccc;
}

.card-content {
  padding: 1.5rem;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-img-container {
  position: absolute;
  top: -40px;
  left: 1.5rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  overflow: hidden;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-placeholder i {
  font-size: 1.8rem;
  color: white;
}

.company-name {
  margin-top: 2.5rem;
  font-size: 1.3rem;
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.company-info {
  margin-bottom: 1rem;
  color: var(--text-light);
  font-size: 0.9rem;
}

.company-category, .company-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.company-info i {
  color: var(--primary-color);
  width: 16px;
}

.card-action {
  margin-top: auto;
  text-align: right;
}

.view-details {
  color: var(--primary-color);
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: var(--transition);
}

.comercio-card:hover .view-details {
  color: var(--secondary-color);
}

.view-details i {
  font-size: 0.8rem;
  transition: var(--transition);
}

.comercio-card:hover .view-details i {
  transform: translateX(3px);
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .comercios-header h1 {
    font-size: 2rem;
  }
  
  .comercios-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .comercios-header h1 {
    font-size: 1.8rem;
  }
  
  .comercios-content {
    margin: 1.5rem auto;
  }
  
  .comercios-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.2rem;
  }
}

@media (max-width: 576px) {
  .comercios-header h1 {
    font-size: 1.6rem;
  }
  
  .comercios-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    padding: 1.2rem;
  }
  
  .profile-img-container {
    width: 70px;
    height: 70px;
    top: -35px;
  }
  
  .company-name {
    margin-top: 2rem;
  }
}
</style>