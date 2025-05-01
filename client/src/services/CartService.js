// services/CartService.js

// Obtener el carrito desde localStorage o inicializar un array vacío
const getCart = () => {
    const cartJSON = localStorage.getItem('cart')
    return cartJSON ? JSON.parse(cartJSON) : []
  }
  
  // Guardar el carrito en localStorage
  const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }
  
  // Añadir un producto al carrito
  const addToCart = (product, quantity = 1) => {
    const cart = getCart()
    
    // Comprobar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      // Si ya existe, actualizar la cantidad
      existingItem.quantity += quantity
    } else {
      // Si no existe, añadirlo al carrito
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      })
    }
    
    saveCart(cart)
    // Emitir un evento personalizado para que los componentes puedan reaccionar
    window.dispatchEvent(new CustomEvent('cart-updated'))
    return cart
  }
  
  // Eliminar un producto del carrito
  const removeFromCart = (productId) => {
    let cart = getCart()
    cart = cart.filter(item => item.id !== productId)
    saveCart(cart)
    window.dispatchEvent(new CustomEvent('cart-updated'))
    return cart
  }
  
  // Actualizar la cantidad de un producto en el carrito
  const updateCartItemQuantity = (productId, quantity) => {
    const cart = getCart()
    const item = cart.find(item => item.id === productId)
    
    if (item) {
      item.quantity = quantity
      saveCart(cart)
      window.dispatchEvent(new CustomEvent('cart-updated'))
    }
    
    return cart
  }
  
  // Vaciar el carrito
  const clearCart = () => {
    localStorage.removeItem('cart')
    window.dispatchEvent(new CustomEvent('cart-updated'))
    return []
  }
  
  // Obtener el número total de artículos en el carrito
  const getCartTotalItems = () => {
    const cart = getCart()
    return cart.reduce((total, item) => total + item.quantity, 0)
  }
  
  // Obtener el precio total del carrito
  const getCartTotalPrice = () => {
    const cart = getCart()
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
  
  export default {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotalItems,
    getCartTotalPrice
  }