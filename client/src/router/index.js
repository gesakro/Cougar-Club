import { createRouter, createWebHistory } from 'vue-router'
import HomeLayout from '@/components/HomeLayout.vue'

const routes = [
  {
    path: '/',
    component: HomeLayout,
    children: [
      {
        path: '',
        name: 'Home',
        components: {
          navbar: () => import('@/components/AppNavbar.vue'),
          hero: () => import('@/components/HeroSection.vue'),
          footer: () => import('@/components/AppFooter.vue')
        }
      },
      // Nueva ruta hija para login dentro del layout
      {
        path: 'login',
        name: 'Login',
        components: {
          navbar: () => import('@/components/AppNavbar.vue'),
          default: () => import('@/components/UserLogin.vue'),
          footer: () => import('@/components/AppFooter.vue')
        },
        meta: {
          hideHero: true // Oculta solo el HeroSection en login
        }
      }
    ]
  },
  // Redirección para mantener compatibilidad con /login directo
  {
    path: '/login',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router