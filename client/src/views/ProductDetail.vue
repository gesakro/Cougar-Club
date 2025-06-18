<template>
  <div class="product-detail-view">
    <AppNavbar />
    
    <main class="detail-container">
      <div class="breadcrumb">
        <button @click="goBack" class="breadcrumb-link">
          <i class="fas fa-arrow-left"></i> Volver
        </button>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>
      
      <div v-else-if="product" class="product-content">
        <div class="product-gallery single-image">
          <div class="main-image">
            <img :src="product.image" :alt="product.name" class="product-img" />
          </div>
        </div>
        
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-meta">
            <div class="product-category">Categoría: {{ formatCategory(product.category) }}</div>
          </div>
          
          <div class="product-price">{{ formatPrice(product.price) }}</div>
          
          <div class="product-availability" :class="{ 'out-of-stock': product.stock <= 0 }">
            {{ product.stock > 0 ? 'En Stock' : 'Agotado' }}
          </div>
          
          <div class="product-description">
            <h3>Descripción</h3>
            <p>{{ product.description || 'Sin descripción disponible.' }}</p>
          </div>
          
          <div class="product-actions">
            <div class="quantity-selector">
              <button @click="decreaseQuantity" :disabled="quantity <= 1 || product.stock <= 0" class="quantity-btn">
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" v-model.number="quantity" min="1" :max="product.stock" :disabled="product.stock <= 0" class="quantity-input" />
              <button @click="increaseQuantity" :disabled="quantity >= product.stock || product.stock <= 0" class="quantity-btn">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            
            <button 
              @click="addToCart" 
              class="add-to-cart-btn"
              :disabled="product.stock <= 0">
              <i class="fas fa-shopping-cart"></i>
              {{ product.stock > 0 ? 'Añadir al carrito' : 'No disponible' }}
            </button>
          </div>
          
          <div class="product-features">
            <div class="feature">
              <i class="fas fa-truck"></i>
              <span>Envío gratuito para pedidos superiores a 50.000 COP</span>
            </div>
            <div class="feature">
              <i class="fas fa-undo"></i>
              <span>Devoluciones gratuitas dentro de los 30 días</span>
            </div>
            <div class="feature">
              <i class="fas fa-shield-alt"></i>
              <span>Garantía de calidad en todos los productos</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-message">
        <div class="placeholder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#b38b6d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            <path d="M16 16c-1.5-1.5-3.5-2-6-2s-4.5.5-6 2"></path>
          </svg>
        </div>
        <h3>Producto no encontrado</h3>
        <p>El producto que buscas no existe o no está disponible</p>
        <router-link to="/products" class="return-btn">Volver a productos</router-link>
      </div>
      
      <section v-if="product && relatedProducts.length" class="related-products">
        <h2 class="section-title">Descubre otros productos</h2>
        <ProductSection 
          :products="relatedProducts"
          @product-click="handleRelatedProductClick"
        />
      </section>
    </main>
    
    <AppFooter />
    
    <!-- Alerta para mostrar cuando se añade un producto al carrito -->
    <div class="cart-alert" v-if="showCartAlert" :class="{ 'visible': showCartAlert }">
      <div class="alert-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ cartAlertMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ProductSection from '@/components/product/ProductSection.vue'
import CartService from '@/services/CartService'
import axios from 'axios';

// Configuración base para axios (debe ser igual que en ComercioDetail)
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
  name: 'ProductDetail',
  components: {
    AppNavbar,
    AppFooter,
    ProductSection
  },
  data() {
    return {
      product: null,
      loading: true,
      quantity: 1,
      relatedProducts: [],
      showCartAlert: false,
      cartAlertMessage: ''
    }
  },
  methods: {

    goBack() {
      // Si el historial tiene más de una entrada, retrocede; de lo contrario, redirige a '/products'
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/products');
      }
    },

    loadProduct() {
  this.loading = true;
  
  // Obtener el ID del producto de los parámetros de la ruta
  const productIdParam = this.$route.params.id;
  
  // Verificar si venimos de comercio detail (podría ser un ID de MongoDB)
  const isFromComercio = this.$route.query.source === 'comercio';
  
  // Si venimos de comercio detail, cargar el producto desde la API
  if (isFromComercio) {
    apiClient.get(`/products/${productIdParam}`)
      .then(response => {
        this.product = this.mapApiProductToLocal(response.data);
        this.loadRelatedProductsFromApi();
      })
      .catch(error => {
        console.error("Error al cargar el producto:", error);
        // Como fallback, intentar cargar el producto local
        this.loadProductFromLocalData(productIdParam);
      });
  } else {
    // Cargar desde datos locales (simulación)
    this.loadProductFromLocalData(productIdParam);
  }
},

// Método para cargar productos desde datos locales (como tenías antes)
loadProductFromLocalData(productIdParam) {
  setTimeout(() => {
    // Obtener datos de ejemplo
    const allProducts = [
      // ... tus productos de ejemplo ...
    ];

    // Buscar el producto por ID (soporta string y número)
    this.product = allProducts.find(
      p => p.id == productIdParam // doble igual para comparar string y número
    );

    // Seleccionar productos relacionados aleatorios (misma categoría, distinto id)
    if (this.product) {
      const related = allProducts.filter(p => p.id != this.product.id && p.category === this.product.category);
      // Randomizar el array
      for (let i = related.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [related[i], related[j]] = [related[j], related[i]];
      }
      this.relatedProducts = related.slice(0, 4);
    }

    this.loading = false;
  }, 800);
},

// Método para cargar productos relacionados desde la API
loadRelatedProductsFromApi() {
  if (!this.product || !this.product.category) {
    this.relatedProducts = [];
    this.loading = false;
    return;
  }
  
  apiClient.get('/products', {
    params: { 
      category: this.product.category,
      exclude: this.product.id // Usar id del producto actual
    }
  })
  .then(response => {
    // Mapear los productos de la API al formato local
    let related = response.data
      .map(this.mapApiProductToLocal)
      .filter(p => String(p.id) !== String(this.product.id)); // Excluir el actual
    // Randomizar el array
    for (let i = related.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [related[i], related[j]] = [related[j], related[i]];
    }
    this.relatedProducts = related.slice(0, 5);
  })
  .catch(error => {
    console.error("Error al cargar productos relacionados:", error);
    this.relatedProducts = [];
  })
  .finally(() => {
    this.loading = false;
  });
},

// Método para mapear un producto de la API al formato local
mapApiProductToLocal(apiProduct) {
  return {
    id: apiProduct._id, // Usar el ID de MongoDB como ID local
    name: apiProduct.nombre,
    price: apiProduct.precio,
    category: apiProduct.categoria,
    stock: apiProduct.stock || 0,
    rating: apiProduct.calificacion || 4.0,
    isTrending: apiProduct.destacado || false,
    isNew: apiProduct.nuevo || false,
    isBestSeller: apiProduct.masVendido || false,
    description: apiProduct.descripcion || '',
    image: apiProduct.imagen 
  };
},
    formatPrice(price) {
      // Mostrar siempre en COP
      return price ? price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }) : '—';
    },
    formatCategory(category) {
      const categories = {
        'footwear': 'Calzado',
        'clothing': 'Ropa',
        'accessories': 'Accesorios'
      }
      return categories[category] || category
    },
    increaseQuantity() {
      if (this.quantity < this.product.stock) {
        this.quantity++
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    addToCart() {
      if (this.product.stock <= 0) return
      
      // Usar el servicio de carrito para añadir el producto
      CartService.addToCart(this.product, this.quantity)
      
      // Mostrar alerta
      this.cartAlertMessage = `¡${this.product.name} (${this.quantity}) añadido al carrito!`
      this.showCartAlert = true
      
      // Ocultar la alerta después de unos segundos
      setTimeout(() => {
        this.showCartAlert = false
      }, 3000)
    },
    handleRelatedProductClick(product) {
      if (String(product.id) !== String(this.product.id)) {
        // Si venimos de un comercio, mantener los query params
        if (this.$route.query.source === 'comercio' && this.$route.query.comercioId) {
          this.$router.push({
            path: `/product/${product.id}`,
            query: {
              source: 'comercio',
              comercioId: this.$route.query.comercioId
            }
          });
        } else {
          // Navegación normal
          this.$router.push(`/product/${product.id}`);
        }
      }
    }
  },
  created() {
    this.loadProduct()
  },
  watch: {
    // Recargar el producto si cambia el ID en la URL
    '$route.params.id': function() {
      this.loadProduct()
    }
  }
}
</script>

  <style scoped>

  /* Estilos mínimos para la alerta */
.cart-alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 15px 25px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
}

.cart-alert.visible {
  opacity: 1;
  transform: translateY(0);
}

.alert-content {
  display: flex;
  align-items: center;
}

.alert-content i {
  margin-right: 10px;
}
  .product-detail-view {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f3e8d5;
  }
  
  .detail-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .breadcrumb {
    margin-bottom: 2rem;
  }
  
  .breadcrumb-link {
    display: inline-flex;
    align-items: center;
    color: #fff;
    background: linear-gradient(90deg, #b38b6d 0%, #9a735a 100%);
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.7rem 1.5rem;
    box-shadow: 0 2px 8px rgba(179, 139, 109, 0.10);
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
    margin-bottom: 1rem;
    gap: 0.7rem;
  }
  
  .breadcrumb-link:hover {
    background: linear-gradient(90deg, #9a735a 0%, #b38b6d 100%);
    box-shadow: 0 4px 16px rgba(179, 139, 109, 0.18);
    transform: translateY(-2px) scale(1.03);
    color: #fff;
  }
  
  .breadcrumb-link i {
    margin-right: 0.7rem;
    font-size: 1.1rem;
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(179, 139, 109, 0.3);
    border-radius: 50%;
    border-top-color: #b38b6d;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .product-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 4rem;
    background-color: rgb(243, 231, 225);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 2rem;
  }
  
  .product-gallery {
    display: flex;
    flex-direction: column;
  }
  
  .main-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%; /* Mantiene relación de aspecto 1:1 */
    margin-bottom: 1rem;
    overflow: hidden;
    border-radius: 8px;
    background-color: #f8f9fa;
  }
  
  .product-img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .image-thumbnails {
    display: flex;
    gap: 0.5rem;
  }
  
  .thumbnail {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
  }
  
  .thumbnail.active {
    border-color: #b38b6d;
  }
  
  .thumbnail.placeholder {
    background-color: #f1f1f1;
  }
  
  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-info {
    display: flex;
    flex-direction: column;
  }
  
  .product-title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .product-rating i {
    color: #ddd;
  }
  
  .product-rating i.filled {
    color: #ffb74d;
  }
  
  .product-rating i.half-filled {
    position: relative;
  }
  
  .product-rating i.half-filled:after {
    content: "\f089"; /* Font Awesome's star-half icon */
    position: absolute;
    top: 0;
    left: 0;
    color: #ffb74d;
  }
  
  .rating-value {
    margin-left: 0.5rem;
    font-weight: 600;
  }
  
  .product-category {
    color: #666;
    font-size: 0.9rem;
  }
  
  .product-price {
    font-size: 2rem;
    font-weight: 700;
    color: #b38b6d;
    margin-bottom: 1rem;
  }
  
  .product-availability {
    display: inline-block;
    padding: 0.3rem 1rem;
    background-color: #cadfcc;
    color: #28832c;
    border-radius: 4px;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }
  
  .product-availability.out-of-stock {
    background-color: #ecd0d4;
    color: #c62828;
  }
  
  .product-description {
    margin-bottom: 2rem;
  }
  
  .product-description h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .product-description p {
    color: #666;
    line-height: 1.6;
  }
  
  .product-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .quantity-selector {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .quantity-btn {
    width: 36px;
    height: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    transition: background-color 0.3s;
  }
  
  .quantity-btn:hover:not(:disabled) {
    background-color: #f1f1f1;
  }
  
  .quantity-btn:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
  
  .quantity-input {
    width: 50px;
    height: 42px;
    border: none;
    text-align: center;
    font-weight: 600;
    color: #333;
  }
  
  .quantity-input::-webkit-outer-spin-button,
  .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .add-to-cart-btn {
    flex: 1;
    background-color: #b38b6d;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  .add-to-cart-btn:hover:not(:disabled) {
    background-color: #9a735a;
  }
  
  .add-to-cart-btn:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
  
  .product-features {
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .feature {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #666;
  }
  
  .feature i {
    color: #b38b6d;
    font-size: 1.2rem;
  }
  
  .error-message {
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
  
  .return-btn {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background-color: #b38b6d;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .return-btn:hover {
    background-color: #9a735a;
  }
  
  .related-products {
    margin-top: 3rem;
  }
  
  .section-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #333;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  .section-title:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #b38b6d;
  }
  
  @media (max-width: 992px) {
    .product-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .product-gallery {
      order: -1;
    }
  }
  
  @media (max-width: 768px) {
    .product-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .product-actions {
      flex-direction: column;
    }
    
    .quantity-selector {
      width: 100%;
    }
  }

.product-gallery.single-image {
  flex-direction: column;
  align-items: center;
}
.product-gallery .main-image {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 10px rgba(179, 139, 109, 0.08);
}
.product-gallery .product-img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
  </style>