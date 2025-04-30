<!-- views/CartView.vue -->
<template>

    <div>
      <AppNavbar />
      <div class="cart-container">
        <header class="cart-header">
          <h2>Carrito de Compras</h2>
        </header>
  
        <main class="cart-content">
          <div v-if="cart.length === 0" class="empty-cart">
            <p>Tu carrito está vacío.</p>
            <router-link to="/products" class="continue-shopping-btn">
              <strong>Continuar comprando</strong>
            </router-link>
          </div>
  
          <div v-else class="cart-items">
            <div v-for="item in cart" :key="item.id" class="cart-item">
              <img :src="item.image" :alt="item.name" class="product-image" />
              <div class="item-details">
                <h3>{{ item.name }}</h3>
                <p class="item-price"><strong>Precio:</strong> ${{ item.price.toFixed(2) }}</p>
                <div class="quantity-control">
                  <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
                  <input 
                    type="number" 
                    v-model.number="item.quantity" 
                    min="1"
                    class="quantity-input"
                  />
                  <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
                </div>
                <p class="item-subtotal"><strong>Subtotal:</strong> ${{ (item.price * item.quantity).toFixed(2) }}</p>
                <button @click="removeItem(item.id)" class="remove-btn">Eliminar</button>
              </div>
            </div>
  
            <div class="divider"></div>
  
            <div class="cart-summary">
              <h3>Resumen del pedido</h3>
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Envío:</span>
                <span>$0.00</span>
              </div>
              <div class="summary-row total">
                <span><strong>Total:</strong></span>
                <span><strong>${{ totalPrice.toFixed(2) }}</strong></span>
              </div>
              <button @click="checkout" class="checkout-btn"><strong>Finalizar compra</strong></button>
              
              <router-link to="/products" class="continue-link">
                Continuar comprando
              </router-link>
            </div>
          </div>
        </main>
  
        <footer class="cart-footer">
          <table>
            <tr>
              <th>Ayuda</th>
              <th>Servicios</th>
              <th>Sobre Cougar Club</th>
              <th>Envíos</th>
            </tr>
            <tr>
              <td>Preguntas frecuentes</td>
              <td>Devoluciones</td>
              <td>Quiénes somos</td>
              <td>Información sobre tiempos y métodos de envío disponibles en tu área.</td>
            </tr>
            <tr>
              <td>Contacto</td>
              <td>Garantía</td>
              <td>Sostenibilidad</td>
              <td>Seguimiento de pedidos</td>
            </tr>
          </table>
          <p class="footer-brand"><strong>Cougar Club</strong></p>
        </footer>
      </div>
      <AppFooter />
    </div>
  </template>
  
  <script>
  import AppFooter from '@/components/layout/AppFooter.vue';
  import AppNavbar from '@/components/layout/AppNavbar.vue';
  
  export default {
    name: 'CartView',
    components: {
      AppNavbar,
      AppFooter
    },
    data() {
      return {
        // Simulación de carrito, puedes remplazar con una store global si usas Pinia/Vuex
        cart: [
          {
            id: 1,
            name: 'Zapatilla deportiva',
            price: 120.99,
            quantity: 2,
            image: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            name: 'Camiseta básica',
            price: 35.50,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
          }
        ]
      }
    },
    computed: {
      totalPrice() {
        return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      }
    },
    methods: {
      removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id)
      },
      increaseQuantity(item) {
        item.quantity += 1;
      },
      decreaseQuantity(item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        }
      },
      checkout() {
        alert('Gracias por tu compra 😎')
        this.cart = []
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos para el carrito basados en la estética del login */
  .cart-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  
  .cart-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .cart-header h2 {
    font-size: 2rem;
    color: #333;
  }
  
  .cart-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .empty-cart {
    text-align: center;
    padding: 3rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .empty-cart p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .continue-shopping-btn {
    display: inline-block;
    padding: 0.8rem 1.5rem;
    background-color: #4a4a4a;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 1rem;
    transition: background-color 0.3s ease;
  }
  
  .continue-shopping-btn:hover {
    background-color: #333;
  }
  
  .cart-items {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
  
  @media (max-width: 768px) {
    .cart-items {
      grid-template-columns: 1fr;
    }
  }
  
  .cart-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }
  
  .product-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .item-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .item-details h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #333;
  }
  
  .item-price {
    color: #555;
  }
  
  .item-subtotal {
    color: #333;
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
  }
  
  .quantity-btn {
    width: 30px;
    height: 30px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  
  .quantity-input {
    width: 50px;
    height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    margin: 0 0.5rem;
  }
  
  .remove-btn {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
  }
  
  .remove-btn:hover {
    background-color: #d32f2f;
  }
  
  .divider {
    height: 1px;
    background-color: #ddd;
    margin: 1rem 0;
  }
  
  .cart-summary {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    align-self: flex-start;
    position: sticky;
    top: 20px;
    width: 100%;
  }
  
  .cart-summary h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.3rem;
    color: #333;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    color: #555;
  }
  
  .summary-row.total {
    font-size: 1.2rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .checkout-btn {
    width: 100%;
    padding: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-bottom: 1rem;
  }
  
  .checkout-btn:hover {
    background-color: #388E3C;
  }
  
  .continue-link {
    display: block;
    text-align: center;
    color: #555;
    text-decoration: none;
    margin-top: 1rem;
  }
  
  .continue-link:hover {
    text-decoration: underline;
  }
  
  /* Estilos del footer */
  .cart-footer {
    margin-top: 3rem;
    border-top: 1px solid #ddd;
    padding-top: 2rem;
  }
  
  .cart-footer table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
  }
  
  .cart-footer th, .cart-footer td {
    padding: 0.8rem;
    text-align: left;
    vertical-align: top;
    font-size: 0.9rem;
  }
  
  .cart-footer th {
    color: #333;
    font-weight: bold;
  }
  
  .cart-footer td {
    color: #555;
  }
  
  .footer-brand {
    text-align: center;
    font-size: 1.2rem;
    color: #333;
    margin-top: 2rem;
  }
  </style>