<script>
import AppMenu from "./AppMenu.vue";
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import CartService from '@/services/CartService'; // Importar CartService

export default {
  name: "NavBar",
  components: { AppMenu },
  setup() {
    const router = useRouter();
    
    // Variables reactivas
    const searchQuery = ref("");
    const searchActive = ref(false);
    const cartItems = ref(0); // Inicializado a 0
    const mobileExpanded = ref(false);
    const userMenuOpen = ref(false);
    const userName = ref("");
    const userEmail = ref("");
    const userRole = ref("");
    const searchInput = ref(null);
    const userMenu = ref(null);
    
    // Computed property
    const isLoggedIn = computed(() => {
      return !!localStorage.getItem('token');
    });
    
    // Métodos
    const toggleUserMenu = () => {
      userMenuOpen.value = !userMenuOpen.value;
    };
    
    const activateSearch = () => {
      searchActive.value = true;
      if (window.innerWidth <= 768) {
        mobileExpanded.value = true;
      }
    };
    
    const deactivateSearch = () => {
      searchActive.value = false;
      mobileExpanded.value = false;
    };
    
    const logout = () => {
      // Eliminar token y datos de usuario del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      
      // Actualizar variables reactivas
      userName.value = "";
      userEmail.value = "";
      userRole.value = "";
      
      // Cerrar el menú desplegable
      userMenuOpen.value = false;
      
      // Redirigir a la página de inicio
      router.push('/');
    };
    
    const handleClickOutside = (event) => {
      if (userMenu.value && !userMenu.value.contains(event.target) && 
          !event.target.closest('.icon-button')) {
        userMenuOpen.value = false;
      }
    };
    
    const getUserInfo = () => {
      if (isLoggedIn.value) {
        userName.value = localStorage.getItem('userName') || 'Usuario';
        userEmail.value = localStorage.getItem('userEmail') || '';
        userRole.value = localStorage.getItem('userRole') || 'Usuario';
      }
    };
    
    // Método para actualizar el contador del carrito
    const updateCartCounter = () => {
      cartItems.value = CartService.getCartItemCount();
    };
    
    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      getUserInfo();
      
      // Escuchar cambios en localStorage para actualizar datos de usuario en tiempo real
      window.addEventListener('storage', (event) => {
        if (event.key === 'token' || event.key === 'userName' || 
            event.key === 'userEmail' || event.key === 'userRole') {
          getUserInfo();
        }
      });
      
      // Escuchar el evento cart-updated para actualizar el contador del carrito
      window.addEventListener('cart-updated', updateCartCounter);
      
      // Inicializar el contador del carrito
      updateCartCounter();
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('storage', getUserInfo);
      window.removeEventListener('cart-updated', updateCartCounter);
    });
    
    return {
      searchQuery,
      searchActive,
      cartItems,
      mobileExpanded,
      userMenuOpen,
      userName,
      userEmail,
      userRole,
      isLoggedIn,
      searchInput,
      userMenu,
      toggleUserMenu,
      activateSearch,
      deactivateSearch,
      logout,
      handleClickOutside,
      getUserInfo
    };
  }
};
</script>

<template>
  <nav class="navbar">
    <!-- Sección izquierda -->
    <div class="left-section">
      <AppMenu />
      <div class="search-container" :class="{ 'active': searchActive, 'mobile-expanded': mobileExpanded }">
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @focus="activateSearch"
          @blur="deactivateSearch"
        />
        <button class="search-button" aria-label="Search">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>

    <!-- Logo centrado -->
    <router-link to="/" class="logo">Cougar Club</router-link>

    <!-- Sección derecha -->
    <div class="right-section">
      <!-- Botón de usuario con menú desplegable -->
      <div class="dropdown-container">
        <button class="icon-button" @click="toggleUserMenu" aria-label="User profile">
          <div class="user-icon">
            <i class="fas fa-user-circle"></i>
          </div>
          <span v-if="isLoggedIn" class="user-status-indicator"></span>
        </button>
        
        <!-- Menú desplegable -->
        <div class="dropdown-menu" v-show="userMenuOpen" ref="userMenu">
          <div v-if="isLoggedIn" class="user-info">
            <p class="user-name">{{ userName }}</p>
            <small class="user-email">{{ userEmail }}</small>
            <small class="user-role">{{ userRole }}</small>
          </div>
          
          <div class="dropdown-divider" v-if="isLoggedIn"></div>
          
          <router-link to="/profile" class="dropdown-item" v-if="isLoggedIn">
            <i class="fas fa-user-circle"></i> Mi Perfil
          </router-link>
          
          <!-- Enlaces para todos los usuarios logueados -->
          <router-link to="/orders" class="dropdown-item" v-if="isLoggedIn">
            <i class="fas fa-shopping-bag"></i> Mis Pedidos
          </router-link>
          
          <router-link to="/wishlist" class="dropdown-item" v-if="isLoggedIn">
            <i class="fas fa-heart"></i> Lista de Deseos
          </router-link>
          
          <!-- Enlaces específicos para administradores -->
          <template v-if="isLoggedIn && userRole === 'admin'">
            <div class="dropdown-divider"></div>
            <router-link to="/gestionar-comercio" class="dropdown-item">
              <i class="fas fa-store"></i> Gestionar Comercio
            </router-link>
            <router-link to="/admin" class="dropdown-item">
              <i class="fas fa-user-shield"></i> Panel Admin
            </router-link>
            <router-link to="/reportes" class="dropdown-item">
              <i class="fas fa-chart-bar"></i> Reportes
            </router-link>
          </template>
          
          <!-- Enlaces específicos para vendedores -->
          <template v-if="isLoggedIn && userRole === 'vendedor'">
            <div class="dropdown-divider"></div>
            <router-link to="/mis-ventas" class="dropdown-item">
              <i class="fas fa-tags"></i> Mis Ventas
            </router-link>
            <router-link to="/inventario" class="dropdown-item">
              <i class="fas fa-boxes"></i> Inventario
            </router-link>
          </template>
          
          <!-- Enlaces específicos para clientes (ya están incluidos arriba) -->
          
          <div class="dropdown-divider" v-if="isLoggedIn"></div>
          
          <button class="dropdown-item logout-btn" @click="logout" v-if="isLoggedIn">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
          
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="dropdown-item">
              <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </router-link>
            
            <router-link to="/signup" class="dropdown-item">
              <i class="fas fa-user-plus"></i> Registrarse
            </router-link>
          </template>
        </div>
      </div>
      
      <!-- Botón de carrito -->
      <button class="icon-button cart-button" aria-label="Shopping cart">
        <router-link to="/cart" class="cart-link">🛒</router-link>
        <span class="cart-counter" v-if="cartItems > 0">{{ cartItems }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* === ESTRUCTURA PRINCIPAL === */
.navbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #250902;
  padding: 0.8rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 800;
  min-height: 70px;
  width: 100%;
  box-sizing: border-box;
}

/* === SECCIÓN IZQUIERDA === */
.left-section {
  display: flex;
  align-items: center;
  justify-self: start;
  gap: 15px;
  flex-shrink: 1;
  min-width: 0;
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  width: 200px;
  max-width: 100%;
}

.search-input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 0.3rem;
  outline: none;
  font-size: 1rem;
  text-overflow: ellipsis;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
  flex-shrink: 0;
}

.search-icon {
  font-size: 1.2rem;
  display: flex;
}

/* === LOGO CENTRADO === */
.logo {
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  justify-self: center;
  white-space: nowrap;
  transition: opacity 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* === SECCIÓN DERECHA === */
.right-section {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 15px;
  flex-shrink: 0;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  transform: scale(1.05);
}

.user-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
}

.cart-link {
  text-decoration: none;
  font-size: 1.2rem;
  display: flex;
}

.cart-counter {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === DROPDOWN MENU === */
.dropdown-container {
  position: relative;
}

.user-status-indicator {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 8px;
  height: 8px;
  background-color: #4CAF50;
  border-radius: 50%;
  border: 2px solid #250902;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  padding: 1rem 0;
  z-index: 900;
  transition: all 0.3s ease;
  animation: fadeIn 0.2s ease-out;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 15px;
  width: 12px;
  height: 12px;
  background-color: white;
  transform: rotate(45deg);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.user-info {
  padding: 0.5rem 1.5rem;
  margin-bottom: 0.5rem;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
  color: #333;
}

.user-email, 
.user-role {
  font-size: 0.85rem;
  color: #777;
  display: block;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-weight: 500;
  color: #5a5a5a;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.dropdown-item i {
  margin-right: 0.75rem;
  font-size: 1rem;
  color: #666;
  width: 20px;
  text-align: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #73614C;
}

.dropdown-item:active {
  background-color: #f0f0f0;
}

button.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.logout-btn {
  color: #dc3545;
}

.logout-btn:hover {
  background-color: #fff5f5;
  color: #dc3545;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === MEJORAS PARA BÚSQUEDA EN MÓVIL === */
@media (max-width: 768px) {
  .navbar {
    grid-template-columns: auto 1fr auto;
    padding: 0.8rem 1rem;
    gap: 10px;
  }

  .search-container {
    width: 40px;
    justify-content: center;
    padding: 0.5rem;
    transition: all 0.3s ease;
  }

  .search-container .search-input {
    display: none;
    width: 0;
    transition: width 0.3s ease;
  }

  .search-container.mobile-expanded {
    position: absolute;
    left: 1rem;
    right: 1rem;
    top: 15px;
    width: calc(100% - 2rem);
    max-width: 100%;
    z-index: 900;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }

  .search-container.mobile-expanded .search-input {
    display: block;
    width: 100%;
    padding: 0.3rem 0.5rem;
  }

  .search-container.mobile-expanded .search-button {
    margin-left: 0;
  }

  .logo {
    font-size: 1.5rem;
    margin-left: 10px;
    max-width: 120px;
    text-align: center;
  }

  .left-section {
    max-width: 30%;
  }

  .right-section {
    max-width: 30%;
  }

  .user-icon {
    width: 24px;
    height: 24px;
    font-size: 1.5rem;
  }
  
  .dropdown-menu {
    width: 250px;
    right: -80px;
  }
  
  .dropdown-menu::before {
    right: 90px;
  }
}

/* Ajuste adicional para pantallas muy pequeñas */
@media (max-width: 480px) {
  .navbar {
    padding: 0.8rem 0.5rem;
  }
  
  .logo {
    font-size: 1.2rem;
    max-width: 100px;
  }
  
  .icon-button {
    padding: 0.3rem;
  }
  
  .left-section, 
  .right-section {
    gap: 8px;
  }
  
  .dropdown-menu {
    width: 200px;
    right: -70px;
  }
}
</style>