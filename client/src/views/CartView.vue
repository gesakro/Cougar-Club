<template>
  <div>
    <AppNavbar />
    <div class="cart-container">
      <header class="cart-header">
        <h2>Carrito de Compras</h2>
      </header>

      <main class="cart-content">
        <div v-if="cart.length === 0" class="empty-cart">
          <div class="placeholder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#b38b6d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>Parece que aún no has añadido productos a tu carrito</p>
          <router-link to="/products" class="continue-shopping-btn">
            Continuar comprando
          </router-link>
        </div>

        <div v-else class="cart-items">
          <div class="cart-products">
            <div class="cart-actions">
              <button @click="clearCart" class="clear-cart-btn">
                Vaciar carrito
              </button>
            </div>
            <div v-for="item in cart" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" class="product-image" />
              </div>
              <div class="item-details">
                <div class="item-info">
                  <h3>{{ item.name }}</h3>
                  <p class="item-price">{{ formatPrice(item.price) }}</p>
                </div>
                <div class="item-actions">
                  <div class="quantity-control">
                    <button @click="decreaseQuantity(item)" class="quantity-btn">
                      <span class="control-icon">−</span>
                    </button>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      min="1"
                      class="quantity-input"
                      @change="updateQuantity(item)"
                    />
                    <button @click="increaseQuantity(item)" class="quantity-btn">
                      <span class="control-icon">+</span>
                    </button>
                  </div>
                  <p class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</p>
                  <button @click="removeItem(item.id)" class="remove-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Resumen del pedido</h3>
            <div class="summary-row">
              <span>Subtotal ({{ totalItems }} artículos):</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="summary-row">
              <span>Envío:</span>
              <span>{{ formatPrice(0) }}</span>
            </div>
            <div class="summary-row total">
              <span><strong>Total:</strong></span>
              <span><strong>{{ formatPrice(totalPrice) }}</strong></span>
            </div>
            <button @click="checkout" class="checkout-btn">
              Finalizar compra
            </button>
            
            <router-link to="/products" class="continue-link">
              Continuar comprando
            </router-link>
          </div>
        </div>
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from '@/components/layout/AppFooter.vue';
import AppNavbar from '@/components/layout/AppNavbar.vue';
import CartService from '@/services/CartService';

export default {
  name: 'CartView',
  components: {
    AppNavbar,
    AppFooter
  },
  data() {
    return {
      cart: []
    }
  },
  computed: {
    totalPrice() {
      return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    },
    totalItems() {
      return this.cart.reduce((acc, item) => acc + item.quantity, 0)
    }
  },
  methods: {
    loadCart() {
      this.cart = CartService.getCart()
    },
    removeItem(id) {
      CartService.removeFromCart(id)
      this.loadCart()
    },
    clearCart() {
      if (confirm('¿Estás seguro que deseas vaciar tu carrito?')) {
        CartService.clearCart()
        this.loadCart()
      }
    },
    increaseQuantity(item) {
      CartService.updateCartItemQuantity(item.id, item.quantity + 1)
      this.loadCart()
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        CartService.updateCartItemQuantity(item.id, item.quantity - 1)
        this.loadCart()
      }
    },
    updateQuantity(item) {
      // Asegurarse de que la cantidad sea al menos 1
      const quantity = Math.max(1, item.quantity)
      CartService.updateCartItemQuantity(item.id, quantity)
      this.loadCart()
    },
    checkout() {
      // Simulación de proceso de compra
      alert('¡Gracias por tu compra!')
      CartService.clearCart()
      this.loadCart()
    },
    formatPrice(price) {
      return new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(price)
    }
  },
  created() {
    this.loadCart()
    
    // Escuchar cambios en el carrito (por si se modifica desde otra página)
    window.addEventListener('cart-updated', this.loadCart)
  },
  beforeUnmount() {
    // Eliminar el evento cuando se desmonta el componente
    window.removeEventListener('cart-updated', this.loadCart)
  }
}
</script>

<style scoped>
/* Estilos para el carrito */

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: Arial, sans-serif;
}

.cart-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cart-header h2 {
  font-size: 2rem;
  color: #333;
  position: relative;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.cart-header h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: #b38b6d;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background-color: white;
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

.empty-cart h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-cart p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.continue-shopping-btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #b38b6d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  font-weight: 600;
}

.continue-shopping-btn:hover {
  background-color: #9a735a;
}

.cart-items {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-products {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.clear-cart-btn {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.clear-cart-btn:hover {
  background-color: #d32f2f;
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #333;
}

.item-price {
  color: #b38b6d;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #eaeaea;
}

.control-icon {
  font-size: 16px;
  line-height: 1;
  display: block;
  font-weight: bold;
}

.quantity-input {
  width: 40px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  font-size: 1rem;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input {
  -moz-appearance: textfield;
}

.item-subtotal {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #f44336;
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.cart-summary {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.cart-summary h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.8rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #555;
}

.summary-row.total {
  font-size: 1.2rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 1rem;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background-color: #b38b6d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 1rem;
}

.checkout-btn:hover {
  background-color: #9a735a;
}

.continue-link {
  display: block;
  text-align: center;
  color: #666;
  text-decoration: none;
  margin-top: 1rem;
  transition: color 0.2s;
}

.continue-link:hover {
  color: #b38b6d;
  text-decoration: underline;
}

@media (max-width: 992px) {
  .cart-items {
    grid-template-columns: 3fr 2fr;
  }
}

@media (max-width: 768px) {
  .cart-items {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
    order: -1;
    margin-bottom: 1rem;
  }
  
  .cart-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
  
  .item-actions {
    flex-wrap: wrap;
  }
}
</style>