// CartService.js
const CART_KEY = 'shopping_cart';
const ORDER_HISTORY_KEY = 'order_history';


const CartService = {
  // Obtener el carrito desde localStorage
  getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },
  
  // Obtener el número total de items en el carrito
  getCartItemCount() {
    const cart = this.getCart();
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  },
  
  // Añadir un producto al carrito
  async addToCart(product, quantity = 1) {
    try {
      // Verificar stock disponible
      const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/products/${product.id}/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'No hay suficiente stock disponible');
      }

      const cart = this.getCart();
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Verificar si la nueva cantidad total no excede el stock
        const newQuantity = cart[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          throw new Error('No hay suficiente stock disponible');
        }
        cart[existingItemIndex].quantity = newQuantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          stock: product.stock
        });
      }
      
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      this._notifyCartUpdated();
      return true;
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      throw error;
    }
  },
  
  // Eliminar un producto del carrito
  removeFromCart(productId) {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    this._notifyCartUpdated();
  },
  
  // Actualizar la cantidad de un producto
  async updateCartItemQuantity(productId, quantity) {
    try {
      // Verificar stock disponible
      const response = await fetch(`${process.env.VUE_APP_API_URL || 'http://localhost:5000/api'}/products/${productId}/check-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'No hay suficiente stock disponible');
      }

      const cart = this.getCart();
      const itemIndex = cart.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        this._notifyCartUpdated();
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  },
  
  // Vaciar carrito
  clearCart() {
    localStorage.removeItem(CART_KEY);
    this._notifyCartUpdated();
  },

  finalizeOrder() {
  const cart = this.getCart();
  if (cart.length === 0) return false;

  const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY)) || [];

  const newOrder = {
    id: Date.now(), // ID único
    items: cart,
    date: new Date().toISOString()
  };

  history.push(newOrder);
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history));

  this.clearCart(); // Esto también lanza _notifyCartUpdated()
  return true;
},

getOrderHistory() {
  return JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY)) || [];
},


  
  // Método privado para notificar a los componentes sobre los cambios en el carrito
  _notifyCartUpdated() {
    // Emitir un evento personalizado para notificar a los componentes
    window.dispatchEvent(new Event('cart-updated'));
  }
};

export default CartService;