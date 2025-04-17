import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '@/components/UserLogin.vue'; // Asegúrate de que el nombre coincida

const routes = [
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