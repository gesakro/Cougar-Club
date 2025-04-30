<template>
    <div class="product-detail-view">
      <AppNavbar />
      
      <main class="detail-container">
        <div class="breadcrumb">
          <router-link to="/products" class="breadcrumb-link">
            <i class="fas fa-arrow-left"></i> Volver a productos
          </router-link>
        </div>
        
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
        </div>
        
        <div v-else-if="product" class="product-content">
          <div class="product-gallery">
            <div class="main-image">
              <img :src="product.image" :alt="product.name" class="product-img" />
            </div>
            <div class="image-thumbnails">
              <!-- En una tienda real podrías tener múltiples imágenes -->
              <div class="thumbnail active">
                <img :src="product.image" :alt="product.name" class="thumbnail-img" />
              </div>
              <div class="thumbnail placeholder"></div>
              <div class="thumbnail placeholder"></div>
              <div class="thumbnail placeholder"></div>
            </div>
          </div>
          
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-meta">
              <div class="product-rating">
                <i v-for="i in 5" :key="i" class="fas fa-star" 
                   :class="{ 'filled': i <= Math.floor(product.rating), 'half-filled': i - 0.5 === Math.floor(product.rating) }"></i>
                <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
              </div>
              
              <div class="product-category">Categoría: {{ formatCategory(product.category) }}</div>
            </div>
            
            <div class="product-price">{{ formatPrice(product.price) }}</div>
            
            <div class="product-availability" :class="{ 'out-of-stock': product.stock <= 0 }">
              {{ product.stock > 0 ? 'En Stock' : 'Agotado' }}
            </div>
            
            <div class="product-description">
              <h3>Descripción</h3>
              <p>{{ product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' }}</p>
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
                <span>Envío gratuito para pedidos superiores a 50€</span>
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
          <h2 class="section-title">Productos relacionados</h2>
          <ProductSection 
            :products="relatedProducts"
            @product-click="handleRelatedProductClick"
          />
        </section>
      </main>
      
      <AppFooter />
    </div>
  </template>
  
  <script>
  import AppNavbar from '@/components/layout/AppNavbar.vue'
  import AppFooter from '@/components/layout/AppFooter.vue'
  import ProductSection from '@/components/product/ProductSection.vue'
  import CartService from '@/services/CartService'
  
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
        relatedProducts: []
      }
    },
    methods: {
      loadProduct() {
        this.loading = true
        
        // Simulamos obtener el producto por ID desde la API
        // En una aplicación real, esto se haría con una llamada a la API
        setTimeout(() => {
          // Obtener el ID del producto de los parámetros de la ruta
          const productId = parseInt(this.$route.params.id)
          
          // Obtener datos de ejemplo (en producción, esto vendría de tu API)
          const allProducts = [
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
          ]
          
          // Buscar el producto por ID
          this.product = allProducts.find(p => p.id === productId)
          
          // Buscar productos relacionados (misma categoría)
          if (this.product) {
            this.relatedProducts = allProducts
              .filter(p => p.id !== this.product.id && p.category === this.product.category)
              .slice(0, 4)
          }
          
          this.loading = false
        }, 800)
      },
      formatPrice(price) {
        return new Intl.NumberFormat('es-ES', { 
          style: 'currency', 
          currency: 'EUR' 
        }).format(price)
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
      },
      handleRelatedProductClick(product) {
        // Navegar al nuevo producto
        this.$router.push(`/product/${product.id}`)
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
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
  }
  
  .breadcrumb-link:hover {
    color: #b38b6d;
  }
  
  .breadcrumb-link i {
    margin-right: 0.5rem;
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
  </style>