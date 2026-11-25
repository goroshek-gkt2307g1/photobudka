<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { API } from '@/services/api';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const requests = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  if (!auth.user) return;
  if (auth.isPhotographer) {
    router.push(`/profile/${auth.user.id}`);
    return;
  }
  try {
    requests.value = await API.requests.getByCustomer(auth.user.id);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const logout = async () => {
  await auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="dash-wrapper">
    <!-- Шапка -->
    <div class="dash-header">
      <div>
        <h1 class="name">{{ auth.user?.name }}</h1>
        <p class="email">{{ auth.user?.email }}</p>
      </div>
      <button @click="logout" class="logout">Выйти</button>
    </div>

    <!-- 2 карточки -->
    <div class="cards-grid">
      <!-- Профиль -->
      <div class="card profile-card">
        <div class="avatar"></div>
        <h2 class="card-name">{{ auth.user?.name }}</h2>
        <p class="card-email">{{ auth.user?.email }}</p>
        <a href="#" class="edit-link">Изменить имя</a>
      </div>

      <!-- Заявки -->
      <div class="card">
        <h2 class="section-title">Мои заявки</h2>
        
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="requests.length === 0" class="empty">У вас пока нет заявок</div>

        <div v-else class="request-list">
          <div v-for="req in requests" :key="req.id" class="request-item">
            <div class="req-info">
              <span class="req-photographer">{{ req.name }}</span>
              <span class="req-meta">{{ req.desired_date }} · {{ req.genre }}</span>
            </div>
            <span class="badge" :class="req.status === 'new' ? 'badge-wait' : 'badge-ok'">
              {{ req.status === 'new' ? 'Ожидает' : 'Принята' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-wrapper { max-width: 1000px; margin: 0 auto; padding: 60px 20px; background: var(--vb-bg); min-height: 100vh; }

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--vb-line);
  padding-bottom: 30px;
  margin-bottom: 40px;
}
.name { margin: 0; font-size: 28px; font-weight: 800; }
.email { margin: 6px 0 0; font-size: 15px; color: var(--vb-gray); }
.logout { background: none; border: none; color: #c1121f; font-weight: 600; font-size: 14px; cursor: pointer; }
.logout:hover { text-decoration: underline; }

.cards-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }

.card {
  background: #fff;
  border: 1px solid var(--vb-line);
  border-radius: 4px;
  padding: 32px;
}

.profile-card { text-align: center; }
.avatar { width: 88px; height: 88px; border-radius: 50%; background: #f0f0f0; margin: 0 auto 16px; }
.card-name { margin: 0; font-size: 22px; font-weight: 700; }
.card-email { margin: 6px 0 0; font-size: 14px; color: var(--vb-gray); }
.edit-link { display: inline-block; margin-top: 16px; font-size: 14px; font-weight: 600; color: var(--vb-burgundy); text-decoration: none; }
.edit-link:hover { text-decoration: underline; }

.section-title { margin: 0 0 20px; font-size: 18px; font-weight: 700; }

.request-list { display: flex; flex-direction: column; gap: 16px; }
.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vb-line);
}
.request-item:last-child { border-bottom: none; padding-bottom: 0; }

.req-photographer { display: block; font-size: 15px; font-weight: 600; }
.req-meta { display: block; font-size: 13px; color: var(--vb-gray); margin-top: 4px; }

.badge { padding: 4px 10px; border-radius: 3px; font-size: 12px; font-weight: 700; }
.badge-wait { background: #fff0b8; color: #6b5200; }
.badge-ok { background: #d6f3e3; color: #0d6b3f; }

.empty { padding: 40px; text-align: center; color: var(--vb-gray); }
.status { text-align: center; padding: 40px; color: var(--vb-gray); }

@media (max-width: 760px) { .cards-grid { grid-template-columns: 1fr; } }
</style>