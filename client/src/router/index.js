import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '@/components/UserLogin.vue'; // Asegúrate de que el nombre coincida
import Home from '@/components/Home.vue'; // Ejemplo: componente para la ruta principal

const routes = [
  {
    path: '/', 
    component: Home // Página principal
  },
  {
    path: '/login',
    component: UserLogin // Página de login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;