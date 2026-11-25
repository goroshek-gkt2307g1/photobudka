import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },

    // ТОЛЬКО ДЛЯ ЗАКАЗЧИКОВ
    { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true, role: 'customer' } },

    // ДЛЯ ВСЕХ
    { path: '/profile/:id', name: 'profile', component: () => import('@/views/ProfileView.vue') },
    { path: '/project/:id', name: 'project', component: () => import('@/views/ProjectView.vue') },
    { path: '/request/:id', name: 'request', component: () => import('@/views/RequestView.vue') },

    // ТОЛЬКО ДЛЯ ФОТОГРАФОВ
    {
      path: '/create-project',
      name: 'create-project',
      component: () => import('@/views/CreateProjectView.vue'),
      meta: { requiresAuth: true, role: 'photographer' }
    },
    {
      path: '/project/:id/edit',
      name: 'edit-project',
      component: () => import('@/views/CreateProjectView.vue'),
      meta: { requiresAuth: true, role: 'photographer' }
    },
    { path: '/edit-profile', name: 'edit-profile', component: () => import('@/views/EditProfileView.vue'), meta: { requiresAuth: true, role: 'photographer' } },

    // Заглушка для редактирования (чтобы не было белого экрана)
    { path: '/project/:id/edit', name: 'edit-project', component: () => import('@/views/CreateProjectView.vue'), meta: { requiresAuth: true, role: 'photographer' } },
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.user === null) await auth.fetchCurrentUser();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  // Если заказчик лезет к фотографу -> на главную
  if (to.meta.role === 'photographer' && auth.isCustomer) {
    return { name: 'home' };
  }

  // Если фотограф лезет к заказчику -> на свой профиль
  if (to.meta.role === 'customer' && auth.isPhotographer) {
    return { name: 'profile', params: { id: auth.user?.id } };
  }
});

export default router;