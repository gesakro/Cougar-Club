// CartService.js
const CART_KEY = 'cart_items';
const ORDER_HISTORY_KEY = 'order_history';


const CartService = {
  // Obtener el carrito desde localStorage
  getCart() {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  },
  
  // Obtener el número total de items en el carrito
  getCartItemCount() {
    const cart = this.getCart();
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  },
  
  // Añadir un producto al carrito
  addToCart(product, quantity = 1) {
    const cart = this.getCart();
    
    // Comprobar si el producto ya está en el carrito
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad si ya existe
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Añadir nuevo producto al carrito
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    // Guardar en localStorage
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    // Notificar cambios en el carrito
    this._notifyCartUpdated();
    
    return true;
  },
  
  // Eliminar un producto del carrito
  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    
    // Notificar cambios en el carrito
    this._notifyCartUpdated();
  },
  
  // Actualizar la cantidad de un producto
  updateCartItemQuantity(productId, quantity) {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      
      // Notificar cambios en el carrito
      this._notifyCartUpdated();
    }
  },
  
  // Vaciar carrito
  clearCart() {
    localStorage.removeItem(CART_KEY);
    
    // Notificar cambios en el carrito
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
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
};

export default CartService;