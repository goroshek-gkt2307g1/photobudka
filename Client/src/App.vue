<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'; 

const auth = useAuthStore();
const router = useRouter(); 

const handleLogout = async () => {
  await auth.logout();
  router.push('/login'); 
};
</script>

<template>
  <header class="main-header">
    <div class="header-inner">
      <RouterLink to="/" class="logo">Фотобудка<span class="logo-dot">.</span></RouterLink>
      
      <nav class="nav-links">
        <template v-if="auth.isAuthenticated">
          <!-- Умная ссылка: Фотограф -> Профиль, Заказчик -> Дашборд -->
          <RouterLink 
            :to="auth.isPhotographer ? `/profile/${auth.user?.id}` : '/dashboard'"
            class="nav-link"
          >
            Мой профиль
          </RouterLink>
          <span class="user-name">{{ auth.user?.name }}</span>
          <!-- Кнопка Выйти теперь использует handleLogout -->
          <button @click="handleLogout" class="btn-logout">Выйти</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-link">Войти</RouterLink>
          <RouterLink to="/register" class="btn-register">Регистрация</RouterLink>
        </template>
      </nav>
    </div>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.main-header {
  background-color: #ffffff;
  border-bottom: 1px solid var(--vb-line);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  font-size: 21px;
  font-weight: 800;
  color: var(--vb-black);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.logo-dot {
  color: var(--vb-burgundy);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: var(--vb-gray);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--vb-burgundy);
}

.user-name {
  font-weight: 600;
  color: var(--vb-burgundy);
  background: #fdfafb;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.btn-register {
  background-color: var(--vb-burgundy);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-register:hover {
  background-color: var(--vb-burgundy-deep);
}

.btn-logout {
  background: none;
  border: none;
  color: #c1121f;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
}

.btn-logout:hover {
  text-decoration: underline;
}
</style>