import { createRouter, createWebHistory } from 'vue-router'
import RequestPasswordReset from '@/views/RequestPasswordReset.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import CompanySignUp from '@/views/CompanySignUp.vue'

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
    path: '/comercios',
    name: 'comercios',
    component: () => import('@/views/ComerciosCC/ComercioLista.vue'),
    meta: {
      title: 'Comercios | Cougar Club'
    }
  },
  {
    path: '/comercios/:id',
    name: 'ComercioDetail',
    component: () => import('@/views/ComerciosCC/comerciosDetail.vue'),
    meta: {
      title: 'Detalle Comercio | Cougar Club'
    },
    props: true
  },
  {
    path: '/gestionar-comercio',
    name: 'GestionarComercio',
    component: () => import('@/views/Admin/companyManagement.vue'),
    meta: {
      title: 'Gestionar Comercio | Cougar Club',
      allowedRoles: ['Administrador']
    }
  },
  {
    path: '/gestionar-ecomercio',
    name: 'GestionareComercio',
    component: () => import('@/views/Gerente/comerceManagament.vue'),
    meta: {
      title: 'Gestionar Comercio | Cougar Club',
      // Permitimos que tanto Administradores como Gerentes puedan acceder
      allowedRoles: ['Administrador', 'Gerente']
    }
  },
  {
    path: '/gestionar-usuario',
    name: 'GestionarUsuario',
    component: () => import('@/views/Admin/userManagement.vue'),
    meta: {
      title: 'Gestionar Usuario | Cougar Club',
      requiresAdmin: true // Solo usuarios Administrador podrán verla
    }
  },
  {
  path: '/orders',
  name: 'Orders',
  component: () => import('@/views/Orders.vue'),
  meta: {
    title: 'Mis Pedidos | Cougar Club'
  }
},
{
  path: '/profile',
  name: 'MyProfile',
  component: () => import('@/views/MyProfile.vue'),
  meta: {
    title: 'Mi Perfil | Cougar Club'
  }
},
  {
    path: '/request-password-reset',
    name: 'RequestPasswordReset',
    component: RequestPasswordReset,
    meta: {
      title: 'Recuperar contraseña | Cougar Club',
      hideNavbar: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      title: 'Cambiar contraseña | Cougar Club',
      hideNavbar: true
    }
  },
  {
    path: '/registro-empresa',
    name: 'CompanySignUp',
    component: CompanySignUp
  },
  // Esta ruta catch-all DEBE SER la última
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Página no encontrada | Cougar Club'
    }
  },

]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.meta.requiresScrollTop) {
      return { top: 0, behavior: 'smooth' }
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 100
      }
    }

    return { left: 0, top: 0 }
  }
})

// Guardias de navegación globales
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Cougar Club'
  const userRole = localStorage.getItem('userRole')

  // Validar rutas con propiedad allowedRoles
  if (to.meta.allowedRoles) {
    if (!to.meta.allowedRoles.includes(userRole)) {
      return next({ name: 'Home' })
    }
  }
  // Validar rutas que requieren exclusivamente Administrador
  else if (to.meta.requiresAdmin) {
    if (userRole !== 'Administrador') {
      return next({ name: 'Home' })
    }
  }

  next()
})

router.afterEach((to) => {
  if (to.meta.requiresScrollTop && !to.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
})

export default router
