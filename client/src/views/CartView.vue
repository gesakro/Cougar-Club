<template>
  <div class="cart-page">
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
          <router-link to="/comercios" class="continue-shopping-btn">
            Continuar comprando
          </router-link>
        </div>

        <div v-else class="cart-items">
          <div class="cart-products">
            <div class="cart-header-actions">
              <h3 class="section-title">Productos seleccionados</h3>
              <button @click="clearCart" class="clear-cart-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
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
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h3>Resumen del pedido</h3>
            <div class="summary-items">
              <div class="summary-row">
                <span>Subtotal ({{ totalItems }} artículos)</span>
                <span>{{ formatPrice(totalPrice) }}</span>
              </div>
              <div class="summary-row">
                <span>Envío</span>
                <span>{{ formatPrice(0) }}</span>
              </div>
              <div class="discount-code">
                <input type="text" placeholder="¿Tienes un código de descuento?" class="discount-input">
                <button class="apply-discount">Aplicar</button>
              </div>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
            <button @click="checkout" class="checkout-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Finalizar compra
            </button>
            
            <router-link to="/products" class="continue-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
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
import PurchaseService from '@/services/PurchaseService';

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
      const quantity = Math.max(1, item.quantity)
      CartService.updateCartItemQuantity(item.id, quantity)
      this.loadCart()
    },
    async checkout() {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Debes iniciar sesión para finalizar la compra');
        return;
      }

      const purchaseData = {
        usuario_id: userId,
        productos: this.cart.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precioUnitario: item.price
        })),
        totalCompra: this.totalPrice,
        fecha: new Date().toISOString(),
        estado: 'completado',
        envio: 0
      };
        console.log('👉 Enviando purchaseData:', JSON.stringify(purchaseData, null, 2));
      try {
        await PurchaseService.createPurchase(purchaseData);
        alert('¡Gracias por tu compra!');
        CartService.clearCart();
        this.loadCart();
      } catch (error) {
        console.error('Error al guardar la compra:', error);
        alert('Ocurrió un error al procesar tu compra. Intenta de nuevo.');
      }
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
    window.addEventListener('cart-updated', this.loadCart)
  },
  beforeUnmount() {
    window.removeEventListener('cart-updated', this.loadCart)
  }
}
</script>

<style scoped>
/* Estilos para el carrito con diseño moderno */
.cart-page {
  background-color: #f3e8d5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cart-container {
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  padding: 2rem 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  flex-grow: 1;
}

.cart-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.cart-header h2 {
  font-size: 2.2rem;
  color: #333;
  position: relative;
  padding-bottom: 0.8rem;
  display: inline-block;
  font-weight: 600;
}

.cart-header h2:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: #b38b6d;
  border-radius: 3px;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.empty-cart:hover {
  transform: translateY(-5px);
}

.placeholder-icon {
  margin: 0 auto 2rem;
  width: 100px;
  height: 100px;
  color: #b38b6d;
  opacity: 0.8;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.empty-cart h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
}

.empty-cart p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.continue-shopping-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #b38b6d;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 5px 15px rgba(179, 139, 109, 0.3);
}

.continue-shopping-btn:hover {
  background-color: #9a735a;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(179, 139, 109, 0.4);
}

.cart-items {
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: 2rem;
}

.cart-products {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.cart-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
  font-weight: 500;
}

.clear-cart-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.6rem 1.2rem;
  background-color: #f8f0eb;
  color: #b38b6d;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 500;
}

.clear-cart-btn:hover {
  background-color: #f1e2d9;
  color: #9a735a;
}

.clear-cart-btn svg {
  width: 16px;
  height: 16px;
}

.cart-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.cart-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  background-color: #f8f9fa;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 90%;
  height: 90%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.cart-item:hover .product-image {
  transform: scale(1.05);
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: #333;
  font-weight: 500;
}

.item-price {
  color: #b38b6d;
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 50px;
  overflow: hidden;
  background: #f9f9f9;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #666;
}

.quantity-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.control-icon {
  font-size: 18px;
  line-height: 1;
  display: block;
  font-weight: bold;
}

.quantity-input {
  width: 40px;
  height: 36px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
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
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.remove-btn {
  background: none;
  border: none;
  color: #020202;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.remove-btn:hover {
  color: #f44336;
  background-color: #feeaea;
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

.cart-summary {
  background-color: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.03);
  align-self: flex-start;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.cart-summary h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
  font-weight: 500;
}

.summary-items {
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #555;
  font-size: 1rem;
}

.discount-code {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.discount-input {
  flex-grow: 1;
  padding: 0.8rem 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.discount-input:focus {
  outline: none;
  border-color: #b38b6d;
}

.apply-discount {
  padding: 0.8rem 1.2rem;
  background-color: #f8f0eb;
  color: #b38b6d;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.apply-discount:hover {
  background-color: #f1e2d9;
}

.summary-row.total {
  font-size: 1.3rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 1rem;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
}

.checkout-btn {
  width: 100%;
  padding: 1.1rem;
  background-color: #b38b6d;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  box-shadow: 0 5px 15px rgba(179, 139, 109, 0.3);
}

.checkout-btn:hover {
  background-color: #9a735a;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(179, 139, 109, 0.4);
}

.checkout-btn svg {
  width: 20px;
  height: 20px;
}

.continue-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: color 0.2s;
  font-size: 1rem;
}

.continue-link:hover {
  color: #b38b6d;
}

.continue-link svg {
  transition: transform 0.3s ease;
}

.continue-link:hover svg {
  transform: translateX(-3px);
}

@media (max-width: 992px) {
  .cart-items {
    grid-template-columns: 3fr 2fr;
  }
}

@media (max-width: 768px) {
  .cart-container {
    width: 95%;
    padding: 1.5rem 0;
  }

  .cart-header h2 {
    font-size: 1.8rem;
  }

  .cart-items {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
    order: -1;
    margin-bottom: 1.5rem;
  }
  
  .cart-item {
    flex-direction: column;
    padding: 1.2rem;
  }
  
  .item-image {
    width: 100%;
    height: 180px;
    margin-bottom: 1rem;
  }
  
  .item-actions {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .quantity-control {
    order: 1;
    flex-grow: 1;
  }

  .item-subtotal {
    order: 2;
  }

  .remove-btn {
    order: 3;
  }
}

@media (max-width: 480px) {
  .cart-container {
    padding: 1rem 0;
  }

  .cart-header h2 {
    font-size: 1.6rem;
  }

  .cart-header-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .discount-code {
    flex-direction: column;
  }

  .apply-discount {
    width: 100%;
  }
}
</style>