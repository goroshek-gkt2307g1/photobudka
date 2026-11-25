<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const profile = ref<any>(null);
const projects = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

const isOwner = computed(() => {
  return auth.isAuthenticated && auth.user?.id === profile.value?.user_id_FK;
});

onMounted(async () => {
  try {
    const userId = Number(route.params.id);
    const allProfiles = await API.profiles.getAll();
    const foundProfile = allProfiles.find((p: any) => p.user_id_FK === userId);

    if (!foundProfile) {
      if (auth.user?.id === userId) {
        router.push('/edit-profile');
        return;
      }
      error.value = 'Профиль не найден';
      return;
    }

    profile.value = foundProfile;
    const allProjects = await API.projects.getByProfile(profile.value.id);
    
    if (isOwner.value) {
      projects.value = allProjects;
    } else {
      projects.value = allProjects.filter((p: any) => !p.is_private);
    }
  } catch (e) {
    console.error(e);
    error.value = 'Ошибка загрузки профиля';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="status">Загрузка...</div>
  <div v-else-if="error" class="status error">{{ error }}</div>
  
  <div v-else-if="profile" class="profile-wrapper">
    <div class="profile-top">
      <div class="avatar">
        <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Аватар" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
      </div>
      <div>
        <h1 class="title">{{ profile.photographer_name }}</h1>
        <p class="city">{{ profile.city }} · снимает с 2014 года</p>
      </div>
    </div>

    <div class="profile-content">
      <aside class="sidebar">
        <h2 class="sidebar-title">О фотографе</h2>
        <p class="desc">{{ profile.description || 'Описание пока не добавлено.' }}</p>
        
        <p class="label">Жанры</p>
        <p class="genres">{{ profile.genres || 'Не указаны' }}</p>
        
        <div class="price-box">
          <span class="price-label">Стоимость съемки</span>
          <span class="price-value">от {{ profile.price_hour }} ₽</span>
        </div>

        <template v-if="isOwner">
          <RouterLink to="/create-project" class="t-btnflex action-btn">Создать проект</RouterLink>
          <RouterLink to="/edit-profile" class="t-btnflex action-btn outline">Редактировать профиль</RouterLink>
        </template>
        <template v-else>
          <RouterLink :to="`/request/${profile.user_id_FK}`" class="t-btnflex action-btn">Оставить заявку</RouterLink>
        </template>
      </aside>

      <div class="portfolio">
        <h2 class="portfolio-title">Портфолио</h2>
        <div class="filters">
          <input type="text" class="vb-input" placeholder="Дата" />
          <input type="text" class="vb-input" placeholder="Жанр" />
        </div>

        <div v-if="projects.length === 0" class="empty">
          В портфолио пока нет проектов
        </div>

        <div v-else class="projects-grid">
          <RouterLink 
            v-for="proj in projects" 
            :key="proj.id" 
            :to="`/project/${proj.id}`" 
            class="project-card"
          >
            <div class="proj-thumb">
              <img v-if="proj.cover_photo_url" :src="proj.cover_photo_url" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
            </div>
            <span class="proj-name">{{ proj.title }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-wrapper { max-width: 1240px; margin: 0 auto; padding: 60px 20px; background: #fff; }
.profile-top { display: flex; align-items: center; gap: 24px; padding-bottom: 30px; border-bottom: 1px solid var(--vb-line); margin-bottom: 40px; }
.avatar { width: 100px; height: 100px; border-radius: 50%; background: #f0f0f0; flex: none; overflow: hidden; }
.title { margin: 0; font-size: 28px; font-weight: 800; }
.city { margin: 6px 0 0; font-size: 15px; color: var(--vb-gray); }
.profile-content { display: grid; grid-template-columns: 320px 1fr; gap: 60px; }
.sidebar-title { margin: 0 0 16px; font-size: 18px; font-weight: 800; color: var(--vb-burgundy); }
.desc { margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: var(--vb-gray); }
.label { margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.genres { margin: 0 0 24px; font-size: 14px; color: var(--vb-gray); }
.price-box { border: 1px solid var(--vb-line); padding: 16px; border-radius: 4px; margin-bottom: 24px; }
.price-label { display: block; font-size: 13px; color: var(--vb-gray); margin-bottom: 4px; }
.price-value { font-size: 22px; font-weight: 800; color: var(--vb-burgundy); }
.action-btn { width: 100%; margin-bottom: 12px; }
.action-btn.outline { background: #fff; color: var(--vb-burgundy); border: 1px solid var(--vb-burgundy); }
.action-btn.outline:hover { background: var(--vb-burgundy); color: #fff; }
.portfolio-title { margin: 0 0 20px; font-size: 24px; font-weight: 800; }
.filters { display: flex; gap: 12px; margin-bottom: 24px; }
.filters .vb-input { max-width: 200px; }
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.project-card { text-decoration: none; color: inherit; }
.proj-thumb { width: 100%; aspect-ratio: 4/3; background: #f0f0f0; border-radius: 4px; margin-bottom: 10px; overflow: hidden; }
.proj-name { font-size: 15px; font-weight: 600; }
.empty { padding: 40px; text-align: center; background: #fafafa; border-radius: 4px; color: var(--vb-gray); }
.status { text-align: center; padding: 80px; }
@media (max-width: 960px) { .profile-content { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .projects-grid { grid-template-columns: 1fr 1fr; } }
</style>