<template>

  <div class="comercio-detail-container">
    <AppNavbar />

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando información del comercio...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h2>Ocurrió un problema</h2>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchCompanyDetail">
        <i class="fas fa-sync-alt"></i> Intentar nuevamente
      </button>
    </div>

    <div v-else class="comercio-detail-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="banner-container">
          <img v-if="company.imagenBanner" :src="company.imagenBanner" :alt="`Banner de ${company.nombre}`"
            class="banner-image" />
          <div v-else class="banner-placeholder">
            <i class="fas fa-image"></i>
          </div>
        </div>

        <div class="company-header">
          <div class="profile-container">
            <div class="profile-wrapper">
              <img v-if="company.imagenPerfil" :src="company.imagenPerfil" :alt="`Perfil de ${company.nombre}`"
                class="profile-image" />
              <div v-else class="profile-placeholder">
                <i class="fas fa-store"></i>
              </div>
            </div>
          </div>

          <div class="company-info-primary">
            <h1 class="company-name">{{ company.nombre }}</h1>
            <div class="company-details">
              <div v-if="company.email" class="detail-item">
                <i class="fas fa-envelope"></i>
                <span>{{ company.email }}</span>
              </div>
              <div v-if="company.telefono" class="detail-item">
                <i class="fas fa-phone"></i>
                <span>{{ company.telefono }}</span>
              </div>
              <div v-if="company.ubicacion" class="detail-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ company.ubicacion }}</span>
              </div>
              <div v-if="company.plan" class="plan-badge">
                <i class="fas fa-crown"></i>
                <span>{{ company.plan }}</span>
              </div>
            </div>
          </div>

          <div class="actions-container">
            <a v-if="company.sitioWeb" :href="company.sitioWeb" target="_blank" class="action-btn website-btn">
              <i class="fas fa-globe"></i> Visitar sitio web
            </a>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <section v-if="company.descripcion" class="description-section">
        <div class="section-container">
          <h2 class="section-title">Acerca de nosotros</h2>
          <p class="company-description">{{ company.descripcion }}</p>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="section-container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-tag"></i>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ brands.length }}</h3>
                <p class="stat-label">Marcas</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-box"></i>
              </div>
              <div class="stat-info">
                <h3 class="stat-value">{{ products.length }}</h3>
                <p class="stat-label">Productos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Brands Section -->
      <section class="brands-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Nuestras Marcas</h2>
            <p class="section-subtitle">Descubre las marcas disponibles en {{ company.nombre }}</p>
          </div>

          <div v-if="brands.length > 0" class="brands-container">
            <div v-for="brand in brands" :key="brand._id" class="brand-card">
              <div class="brand-icon">
                <img v-if="brand.imagen" :src="brand.imagen" :alt="brand.nombre" class="brand-image">
                <div v-else class="brand-placeholder">
                  <span>{{ getBrandInitials(brand.nombre) }}</span>
                </div>
              </div>
              <div class="brand-info">
                <h3 class="brand-name">{{ brand.nombre }}</h3>
                <p v-if="brand.descripcion" class="brand-description">{{ brand.descripcion }}</p>
                <p v-if="brand.pais" class="brand-country">
                  <i class="fas fa-globe-americas"></i> {{ brand.pais }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-tags"></i>
            <p>Actualmente no hay marcas registradas para este comercio</p>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="products-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Nuestros Productos</h2>
            <p class="section-subtitle">Explora nuestra colección de productos destacados</p>
          </div>

          <div v-if="products.length > 0" class="filter-container">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" v-model="productSearch" placeholder="Buscar productos..." />
            </div>

            <div class="filter-options">
              <select v-model="sortOption" class="sort-select">
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="price-asc">Precio (Menor a Mayor)</option>
                <option value="price-desc">Precio (Mayor a Menor)</option>
              </select>
            </div>
          </div>

          <div v-if="filteredProducts.length > 0" class="products-grid">
            <div v-for="product in filteredProducts" :key="product._id" class="product-card">
              <div class="product-image-container">
                <img v-if="product.imagen" :src="product.imagen" :alt="product.nombre" class="product-image" />
                <div v-else class="product-image-placeholder">
                  <i class="fas fa-box-open"></i>
                </div>
                <div v-if="product.descuento" class="product-badge">
                  <span>-{{ product.descuento }}%</span>
                </div>
              </div>

              <div class="product-content">
                <h3 class="product-name">{{ product.nombre }}</h3>

                <div v-if="product.marca" class="product-brand">
                  <span>{{ getBrandName(product.marca) }}</span>
                </div>

                <p v-if="product.descripcion" class="product-description">
                  {{ truncateDescription(product.descripcion) }}
                </p>

                <div class="product-meta">
                  <div class="product-price">
                    <span v-if="product.precioAnterior" class="old-price">{{ formatPrice(product.precioAnterior) }}</span>
                    <span class="current-price">{{ formatPrice(product.precio) }}</span>
                  </div>

                  <div class="product-stock" :class="getStockClass(product.stock)">
                    <i class="fas fa-circle"></i>
                    <span>{{ getStockLabel(product.stock) }}</span>
                  </div>
                </div>

                <div class="product-actions">
                  <button class="product-btn details-btn" @click="navigateToProductDetail(product._id)">
                    <i class="fas fa-eye"></i> Ver detalles
                  </button>
                  <button class="product-btn cart-btn" @click="addToCartFromList(product)"
                    :disabled="product.stock <= 0"> <i class="fas fa-shopping-cart"></i> Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="products.length > 0 && filteredProducts.length === 0" class="empty-state">
            <i class="fas fa-search"></i>
            <p>No se encontraron productos que coincidan con tu búsqueda</p>
            <button class="clear-filter-btn" @click="productSearch = ''">
              Limpiar filtro
            </button>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-box-open"></i>
            <p>Actualmente no hay productos registrados para este comercio</p>
          </div>

          <div v-if="filteredProducts.length > 6" class="load-more-container">
            <button class="load-more-btn">
              <i class="fas fa-chevron-down"></i> Cargar más productos
            </button>
          </div>
        </div>
      </section>

      <!-- Related Companies Section -->
      <section class="related-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Comercios Relacionados</h2>
            <p class="section-subtitle">También te pueden interesar</p>
          </div>

          <div class="related-companies">
            <div v-if="relatedCompanies.length > 0" class="related-grid">
              <div v-for="related in relatedCompanies" :key="related._id" class="related-company-card" @click="navigateToCompanyDetail(related._id)">
                <div class="related-banner">
                  <img v-if="related.imagenBanner" :src="related.imagenBanner" :alt="`Banner de ${related.nombre}`" class="related-banner-img" />
                  <div v-else class="related-banner-placeholder">
                    <i class="fas fa-image"></i>
                  </div>
                </div>
                <div class="related-content">
                  <div class="related-profile-img-container">
                    <img v-if="related.imagenPerfil" :src="related.imagenPerfil" :alt="`Perfil de ${related.nombre}`" class="related-profile-img" />
                    <div v-else class="related-profile-placeholder">
                      <i class="fas fa-store"></i>
                    </div>
                  </div>
                  <div class="related-details">
                    <h3 class="related-company-name">{{ related.nombre }}</h3>
                    <p v-if="related.ubicacion" class="related-company-location">
                      <i class="fas fa-map-marker-alt"></i> {{ related.ubicacion }}
                    </p>
                    <p v-if="related.descripcion" class="related-company-description">
                      {{ related.descripcion.length > 70 ? related.descripcion.substring(0, 70) + '...' : related.descripcion }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="related-placeholder">
              <p>No hay comercios relacionados para mostrar.</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="cart-alert" v-if="showCartAlert" :class="{ 'visible': showCartAlert }">
      <div class="alert-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ cartAlertMessage }}</span>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import CartService from '@/services/CartService';
import PriceService from '@/services/PriceService';

// Configuración base para axios
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Agregar interceptor para incluir el token de autenticación si está disponible
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  name: 'ComercioDetail',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      company: {},
      brands: [],
      products: [],
      loading: true,
      error: null,
      productSearch: '',
      sortOption: 'name-asc',
      displayedProducts: 6,
      showCartAlert: false,
      cartAlertMessage: '',
      allCompanies: [],
      relatedCompanies: []
    };
  },
  computed: {
    filteredProducts() {
      if (!this.products.length) return [];

      let result = [...this.products];

      // Filtrar por búsqueda
      if (this.productSearch.trim()) {
        const searchTerm = this.productSearch.toLowerCase();
        result = result.filter(product =>
          product.nombre.toLowerCase().includes(searchTerm) ||
          (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm)) ||
          (this.getBrandName(product.marca).toLowerCase().includes(searchTerm))
        );
      }

      // Ordenar productos
      switch (this.sortOption) {
        case 'name-asc':
          result.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'name-desc':
          result.sort((a, b) => b.nombre.localeCompare(a.nombre));
          break;
        case 'price-asc':
          result.sort((a, b) => parseFloat(a.precio) - parseFloat(b.precio));
          break;
        case 'price-desc':
          result.sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio));
          break;
      }

      return result.slice(0, this.displayedProducts);
    }
  },
  created() {
    this.fetchCompanyDetail();
    window.scrollTo(0, 0);
  },
  mounted() {
    window.scrollTo(0, 0);
  },
  methods: {

    // Añadir este método en la sección "methods" de ComercioDetail.vue
    addToCartFromList(product) {
      if (product.stock <= 0) return;

      // Por defecto añadimos 1 unidad cuando se añade directamente desde la lista
      const quantity = 1;

      // Mapear el producto de la API al formato esperado por CartService
      const cartProduct = {
        id: product._id,
        name: product.nombre,
        price: product.precio,
        image: product.imagen,
        stock: product.stock
      };

      // Usar el servicio de carrito para añadir el producto
      CartService.addToCart(cartProduct, quantity);

      // Mostrar notificación (implementaremos esto a continuación)
      this.showCartNotification(product.nombre, quantity);
    },

    // Método para mostrar notificación
    showCartNotification(productName, quantity) {
      // Ya no usamos hasOwnProperty, simplemente usamos la propiedad directamente
      this.cartAlertMessage = `¡${productName} (${quantity}) añadido al carrito!`;
      this.showCartAlert = true;

      // Ocultar la alerta después de unos segundos
      setTimeout(() => {
        this.showCartAlert = false;
      }, 3000);
    },

    navigateToProductDetail(productId) {
      // Redirigir a la vista de detalle de producto, indicando el origen
      this.$router.push({
        path: `/product/${productId}`,
        query: {
          source: 'comercio',
          comercioId: this.$route.params.id
        }
      });
    },
    async fetchCompanyDetail() {
      this.loading = true;
      this.error = null;

      try {
        const companyId = this.$route.params.id;

        // Obtener la compañía por su ID
        const companyResponse = await apiClient.get(`/companies/${companyId}`);
        this.company = companyResponse.data;

        // Cargar marcas y productos relacionados con la compañía
        await Promise.all([
          this.fetchBrands(companyId),
          this.fetchProducts(companyId)
        ]);

        // Cargar compañías relacionadas
        await this.fetchAllCompanies();

      } catch (error) {
        console.error("Error al cargar los detalles de la compañía:", error);
        this.error = error.response?.data?.message ||
          'Ha ocurrido un error al cargar los detalles de la compañía';
      } finally {
        this.loading = false;
      }
    },

    async fetchBrands(companyId) {
      try {
        const brandResponse = await apiClient.get(`/brands`, {
          params: { compania: companyId }
        });
        this.brands = brandResponse.data;
      } catch (error) {
        console.error("Error al cargar las marcas:", error);
        this.brands = [];
      }
    },

    async fetchProducts(companyId) {
      try {
        const productResponse = await apiClient.get(`/products`, {
          params: { compania_id: companyId }
        });
        this.products = productResponse.data;
      } catch (error) {
        console.error("Error al cargar los productos:", error);
        this.products = [];
      }
    },

    loadMoreProducts() {
      this.displayedProducts += 6;
    },

    formatPrice(price) {
      return PriceService.formatPrice(price);
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    truncateDescription(text, maxLength = 100) {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    },

    getBrandInitials(name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },

    getBrandName(brandId) {
      const brand = this.brands.find(b => b._id === brandId);
      return brand ? brand.nombre : 'Sin marca';
    },

    getStockClass(stock) {
      if (stock <= 0) return 'out-of-stock';
      if (stock < 10) return 'low-stock';
      return 'in-stock';
    },

    getStockLabel(stock) {
      if (stock <= 0) return 'Agotado';
      if (stock < 10) return 'Pocas unidades';
      return 'En stock';
    },

    async fetchAllCompanies() {
      try {
        const response = await apiClient.get('/companies');
        this.allCompanies = response.data.filter(c => c._id !== this.company._id);
        // Randomizar y tomar 4
        let related = [...this.allCompanies];
        for (let i = related.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [related[i], related[j]] = [related[j], related[i]];
        }
        this.relatedCompanies = related.slice(0, 4);
      } catch (error) {
        console.error('Error al cargar compañías relacionadas:', error);
        this.relatedCompanies = [];
      }
    },

    navigateToCompanyDetail(companyId) {
      window.location.href = `/comercios/${companyId}`;
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

:root {
  /* Nueva paleta de colores café-beige */
  --primary-color: #8B7355;
  /* Café más oscuro para elementos principales */
  --secondary-color: #593C29;
  /* Café oscuro para acentos y hover */
  --accent-color: #D2A679;
  /* Beige cálido para destacados */
  --background-color: #F5F0E6;
  /* Beige claro para fondo general */
  --card-background: #F0E6D9;
  /* Beige más claro para tarjetas */
  --hover-color: #A68064;
  /* Café medio para efectos hover */
  --text-color: #3A2A1B;
  /* Café muy oscuro para texto principal */
  --text-light: #6B5B4D;
  /* Café claro para texto secundario */
  --border-color: #D9C8B4;
  /* Beige medio para bordes */
  --shadow: 0 8px 20px rgba(107, 91, 77, 0.1);
  /* Sombra con color café */
  --badge-background: #E6D0B8;
  /* Beige para badges */
  --badge-text: #86624E;
  /* Café medio para texto en badges */
  --button-hover: #6B4C35;
  /* Café oscuro para hover en botones */
  --transition: all 0.3s ease;
  --input-background: #F8F4EE;
  /* Beige muy claro para inputs */
  --success-color: #7D9D64;
  /* Verde oliva para estados positivos */
  --warning-color: #D9A566;
  /* Naranja cálido para advertencias */
  --error-color: #C27474;
  /* Rojo-café para errores */
}

/* Estilos Generales */
.comercio-detail-container {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.comercio-detail-content {
  flex: 1;
}

/* Estado de Carga */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 0;
  flex: 1;
  background-color: var(--background-color);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(139, 115, 85, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1.2s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--text-light);
  font-size: 1.2rem;
  font-weight: 500;
}

/* Estado de Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  flex: 1;
  background-color: var(--background-color);
}

.error-icon {
  font-size: 4rem;
  color: var(--error-color);
  margin-bottom: 1.5rem;
}

.error-container h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.error-container p {
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.retry-btn {
  background-color: var(--primary-color);
  color: var(--card-background);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(89, 60, 41, 0.15);
}

.retry-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

/* Contenedor de Sección */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.8rem;
  font-weight: 600;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: var(--accent-color);
}

.section-subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
}

/* Sección Hero */
.hero-section {
  position: relative;
  margin-bottom: 4rem;
}

.banner-container {
  position: relative;
  height: 320px;
  overflow: hidden;
  border-bottom: 5px solid var(--primary-color);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.95);
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D9C8B4 0%, #B89F84 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-placeholder i {
  font-size: 3.5rem;
  color: var(--card-background);
}

.company-header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  margin-top: -80px;
  position: relative;
  z-index: 2;
}

.profile-container {
  width: 180px;
  margin-right: 2rem;
}

.profile-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid var(--background-color);
  box-shadow: var(--shadow);
  background-color: var(--accent-color);
}

.profile-image {
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
  font-size: 3.5rem;
  color: var(--card-background);
}

.company-info-primary {
  flex: 1;
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 1.8rem;
  box-shadow: var(--shadow);
  min-width: 300px;
  border: 1px solid var(--border-color);
}

.company-name {
  font-size: 2.4rem;
  color: var(--primary-color);
  margin-bottom: 1.2rem;
  font-weight: 700;
}

.company-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-light);
  margin-right: 1.5rem;
  font-weight: 500;
}

.detail-item i {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--badge-background);
  color: var(--badge-text);
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(139, 115, 85, 0.1);
}

.plan-badge i {
  font-size: 0.9rem;
}

.actions-container {
  margin-left: auto;
  display: flex;
  gap: 1rem;
  margin-top: 1.8rem;
}

.action-btn {
  padding: 0.9rem 1.4rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(89, 60, 41, 0.1);
}

.website-btn {
  background-color: var(--card-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.website-btn:hover {
  background-color: var(--border-color);
  transform: translateY(-2px);
}

.contact-btn {
  background-color: var(--primary-color);
  color: var(--card-background);
  border: none;
}

.contact-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

/* Sección de Descripción */
.description-section {
  padding: 3rem 0 2rem;
  background-color: var(--card-background);
  margin: 2rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.company-description {
  font-size: 1.05rem;
  color: var(--text-color);
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

/* Sección de Estadísticas */
.stats-section {
  padding: 3rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(89, 60, 41, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(139, 115, 85, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
  border: 2px solid rgba(139, 115, 85, 0.1);
}

.stat-icon i {
  font-size: 1.8rem;
  color: var(--primary-color);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.3rem;
}

.stat-label {
  color: var(--text-light);
  font-size: 0.95rem;
  font-weight: 500;
}

/* Sección de Marcas */
.brands-section {
  padding: 5rem 0;
  background-color: var(--background-color);
  position: relative;
}

.brands-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-color), transparent);
}

.brands-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.8rem;
  justify-content: center;
}

.brand-card {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 350px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(89, 60, 41, 0.12);
}

.brand-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1.4rem;
  flex-shrink: 0;
  border: 3px solid var(--background-color);
}

.brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-background);
  font-weight: 600;
  font-size: 1.5rem;
}

.brand-info {
  flex: 1;
}

.brand-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.6rem;
}

.brand-description {
  color: var(--text-light);
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
}

.brand-country {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
}

.brand-country i {
  color: var(--primary-color);
}

/* Sección de Productos */
.products-section {
  padding: 5rem 0;
  background-color: var(--card-background);
  position: relative;
}

.products-section::before,
.products-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to right, transparent, var(--primary-color), transparent);
}

.products-section::before {
  top: 0;
  opacity: 0.3;
}

.products-section::after {
  bottom: 0;
  opacity: 0.3;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.2rem;
  background-color: var(--background-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 350px;
}

.search-box i {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
}

.search-box input {
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 2.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text-color);
  transition: var(--transition);
  background-color: var(--input-background);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.2);
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.sort-select {
  padding: 0.9rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--input-background);
  color: var(--text-color);
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.2);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background-color: var(--background-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.product-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 14px 28px rgba(89, 60, 41, 0.15);
}

.product-image-container {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #D9C8B4 0%, #B89F84 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-placeholder i {
  font-size: 3.2rem;
  color: var(--background-color);
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--accent-color);
  color: var(--secondary-color);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 4px 8px rgba(139, 115, 85, 0.2);
}

.product-content {
  padding: 1.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.7rem;
}

.product-brand {
  display: inline-block;
  background-color: var(--badge-background);
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--badge-text);
  margin-bottom: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(139, 115, 85, 0.1);
}

.product-description {
  color: var(--text-light);
  font-size: 0.95rem;
  margin-bottom: 1.2rem;
  flex-grow: 1;
  line-height: 1.7;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--border-color);
}

.product-price {
  display: flex;
  flex-direction: column;
}

.old-price {
  text-decoration: line-through;
  color: var(--text-light);
  font-size: 0.9rem;
}

.current-price {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.3rem;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.product-stock i {
  font-size: 0.75rem;
}

.in-stock {
  color: var(--success-color);
}

.low-stock {
  color: var(--warning-color);
}

.out-of-stock {
  color: var(--error-color);
}

.product-actions {
  display: flex;
  gap: 1rem;
}

.product-btn {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  box-shadow: 0 4px 8px rgba(89, 60, 41, 0.1);
}

.details-btn {
  background-color: var(--badge-background);
  color: var(--badge-text);
}

.details-btn:hover {
  background-color: var(--border-color);
  transform: translateY(-2px);
}

.cart-btn {
  background-color: var(--primary-color);
  color: var(--card-background);
}

.cart-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  text-align: center;
}

.empty-state i {
  font-size: 3.5rem;
  color: var(--text-light);
  margin-bottom: 1.8rem;
  opacity: 0.7;
}

.empty-state p {
  color: var(--text-light);
  font-size: 1.2rem;
  margin-bottom: 1.8rem;
}

.clear-filter-btn {
  background-color: var(--primary-color);
  color: var(--card-background);
  border: none;
  padding: 0.8rem 1.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(89, 60, 41, 0.15);
}

.clear-filter-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-3px);
}

.load-more-container {
  text-align: center;
  margin-top: 3rem;
}

.load-more-btn {
  background-color: transparent;
  color: var(--secondary-color);
  border: 2px solid var(--primary-color);
  padding: 0.9rem 2.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.load-more-btn:hover {
  background-color: var(--primary-color);
  color: var(--card-background);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(89, 60, 41, 0.2);
}

/* Sección de Comercios Relacionados */
.related-section {
  padding: 5rem 0;
  background-color: var(--background-color);
}

.related-companies {
  margin-top: 2.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.related-company-card {
  background-color: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.related-company-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(89, 60, 41, 0.12);
}

.related-banner {
  height: 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #D9C8B4 0%, #B89F84 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-banner-placeholder i {
  font-size: 2.2rem;
  color: #C9BFB3;
}

.related-content {
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  padding: 1.2rem;
}

.related-profile-img-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(115, 97, 76, 0.08);
  border: 3px solid white;
  overflow: hidden;
  flex-shrink: 0;
}

.related-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-profile-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-profile-placeholder i {
  font-size: 1.5rem;
  color: white;
}

.related-details {
  flex: 1;
}

.related-company-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.related-company-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-light);
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}

.related-company-location i {
  color: var(--accent-color);
}

.related-company-description {
  color: var(--text-light);
  font-size: 0.92rem;
  line-height: 1.5;
}

/* Estilos Responsivos */
@media (max-width: 1024px) {
  .company-header {
    margin-top: -60px;
  }

  .profile-container {
    width: 160px;
  }

  .profile-wrapper {
    width: 160px;
    height: 160px;
  }

  .company-name {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .banner-container {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .banner-container {
    height: 220px;
  }

  .company-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -50px;
  }

  .profile-container {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }

  .company-info-primary {
    width: 100%;
  }

  .company-details {
    justify-content: center;
  }

  .actions-container {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .search-box,
  .filter-options {
    width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .filter-container {
    padding: 1.2rem;
  }
}

@media (max-width: 576px) {
  .banner-container {
    height: 180px;
  }

  .profile-wrapper {
    width: 140px;
    height: 140px;
  }

  .company-name {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .brands-container {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .brand-card {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-direction: column;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .product-content {
    padding: 1.5rem;
  }

  .company-info-primary {
    padding: 1.5rem;
  }

  .related-placeholder {
    padding: 2.5rem 1.5rem;
  }
}

/* Estilos para la notificación del carrito - Añadir a las hojas de estilo o en la etiqueta <style> del componente */

.cart-alert {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  background-color: #4caf50;
  color: white;
  padding: 15px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  transform: translateY(100px);
  opacity: 0;
  pointer-events: none;
}

.cart-alert.visible {
  transform: translateY(0);
  opacity: 1;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-content i {
  font-size: 1.5rem;
}

/* Animación para la aparición y desaparición */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(30px);
  }
}

.cart-alert.visible {
  animation: fadeInUp 0.3s forwards;
}

.cart-alert:not(.visible) {
  animation: fadeOutDown 0.3s forwards;
}
</style>