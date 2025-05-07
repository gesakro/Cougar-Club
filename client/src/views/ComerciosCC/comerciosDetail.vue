<template>
  <div class="comercio-detail">
    <div v-if="loading" class="loading">
      <p>Cargando detalles...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <div class="company-header">
        <img
          v-if="company.imagenBanner"
          :src="company.imagenBanner"
          alt="Banner"
          class="banner"
        />
        <div class="company-info">
          <img
            v-if="company.imagenPerfil"
            :src="company.imagenPerfil"
            alt="Perfil"
            class="profile"
          />
          <h1>{{ company.nombre }}</h1>
          <p>{{ company.email }}</p>
          <p>Plan: {{ company.plan }}</p>
        </div>
      </div>
      
      <section class="brands">
        <h2>Marcas</h2>
        <ul v-if="brands.length > 0">
          <li v-for="brand in brands" :key="brand._id">
            {{ brand.nombre }}
          </li>
        </ul>
        <p v-else>No hay marcas registradas para esta compañía</p>
      </section>

      <section class="products">
        <h2>Productos</h2>
        <div v-if="products.length > 0" class="product-grid">
          <div v-for="product in products" :key="product._id" class="product-card">
            <img
              v-if="product.imagen"
              :src="product.imagen"
              alt="Imagen del producto"
              class="product-image"
            />
            <h3>{{ product.nombre }}</h3>
            <p>{{ product.descripcion }}</p>
            <p>Precio: ${{ product.precio }}</p>
            <p>Stock: {{ product.stock }}</p>
          </div>
        </div>
        <p v-else>No hay productos registrados para esta compañía</p>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
  data() {
    return {
      company: {},
      brands: [],
      products: [],
      loading: true,
      error: null,
    };
  },
  created() {
    this.fetchCompanyDetail();
  },
  methods: {
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
        // Verificar si el endpoint de marcas acepta el parámetro compania o compania_id
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
        // Verificar si el endpoint de productos acepta el parámetro compania_id
        const productResponse = await apiClient.get(`/products`, {
          params: { compania_id: companyId }
        });
        this.products = productResponse.data;
      } catch (error) {
        console.error("Error al cargar los productos:", error);
        this.products = [];
      }
    }
  }
};
</script>

<style scoped>
.comercio-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
}

.error {
  color: #e74c3c;
}

.company-header {
  margin-bottom: 30px;
  position: relative;
}

.banner {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.company-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  margin-top: -50px;
  background-color: white;
}

.brands {
  margin-bottom: 30px;
}

.brands ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.brands li {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
}

h1 {
  font-size: 2rem;
  margin: 10px 0;
}

h2 {
  font-size: 1.5rem;
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

h3 {
  font-size: 1.2rem;
  margin: 10px 0;
}
</style>