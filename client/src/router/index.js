import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/AppHome.vue'),
    meta: {
      title: 'Inicio | Cougar Club',
      heroLink: true // Para identificar que viene del botón hero
    }
  },
  {
    path: '/products',
    name: 'ProductSearch',
    component: () => import('@/views/ProductSearch.vue'),
    meta: {
      title: 'Productos | Cougar Club',
      requiresScrollTop: true // Siempre hacer scroll al inicio
    },
    props: (route) => ({ 
      // Pasa los query params como props
      collectionFilter: route.query.collection,
      searchQuery: route.query.q
    })
  },

  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: {
      title: 'Vista única | Cougar Club'
    },
    props: true
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/UserLogin.vue'),
    meta: {
      title: 'Iniciar sesión | Cougar Club',
      hideNavbar: true // Opcional: para ocultar navbar en login
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Página no encontrada | Cougar Club'
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/CartView.vue'),
    meta: {
      title: 'Carrito | Cougar Club'
    }
  },

  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/UserSignUp.vue'),
    meta: {
      title: 'Registro | Cougar Club'
    }
  },

  {
    path: '/recoverPassword',
    name: 'RecoverPassword',
    component: () => import('@/views/RecoverPassword.vue'),
    meta: {
      title: 'Recuperar contraseña | Cougar Club'
    }
  }
  
]

const router = createRouter({
  history: createWebHistory('/'),

  routes,
  scrollBehavior(to, from, savedPosition) {
    // Comportamiento mejorado del scroll
    if (savedPosition) {
      return savedPosition
    }
    
    // Scroll to top para rutas que lo requieran
    if (to.meta.requiresScrollTop) {
      return { top: 0, behavior: 'smooth' }
    }
    
    // Scroll a elementos con hash
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 100 // Offset para el navbar
      }
    }
    
    return { left: 0, top: 0 }
  }
})

// Guardia global para el título y otras meta propiedades
router.beforeEach((to, from, next) => {
  // Actualizar título
  document.title = to.meta.title || 'Cougar Club'
  
  // Aquí puedes añadir más lógica global:
  // - Analytics
  // - Verificación de autenticación
  // - Carga de datos iniciales
  
  next()
})

// Opcional: Guardia para scroll después de navegación
router.afterEach((to) => {
  if (to.meta.requiresScrollTop && !to.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
})

export default router