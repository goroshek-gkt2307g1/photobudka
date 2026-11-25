<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { API } from '@/services/api';

interface Profile {
  id: number;
  user_id_FK: number;
  photographer_name: string;
  city: string;
  genres: string;
  price_hour: number;
  avatar_url?: string;
}

const profiles = ref<Profile[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    profiles.value = await API.profiles.getAll();
  } catch (e) {
    console.error('Ошибка загрузки каталога', e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="home-wrapper">
    <section class="hero">
      <h1 class="hero-title">Найдите своего фотографа</h1>
      <p class="hero-subtitle">Лучшие специалисты для ваших важных моментов</p>
      <a href="#catalog" class="t-btnflex hero-btn">Смотреть каталог</a>
    </section>

    <section id="catalog" class="catalog">
      <h2 class="catalog-title">Каталог фотографов</h2>
      
      <div v-if="loading" class="status">Загрузка...</div>
      
      <div v-else class="catalog-grid">
        <RouterLink 
          v-for="p in profiles" 
          :key="p.id" 
          :to="`/profile/${p.user_id_FK}`"
          class="photographer-card"
        >
          <div class="card-thumb">
            <img v-if="p.avatar_url" :src="p.avatar_url" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div class="card-info">
            <div class="info-left">
              <span class="name">{{ p.photographer_name }}</span>
              <span class="city">{{ p.city }}</span>
              <span class="genres">{{ p.genres }}</span>
            </div>
            <span class="price">от {{ p.price_hour }} ₽</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-wrapper { background: #fff; min-height: 100vh; padding-bottom: 80px; }
.hero { max-width: 820px; margin: 0 auto; padding: 100px 20px; text-align: center; }
.hero-title { margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -0.03em; }
.hero-subtitle { margin: 16px 0 0; font-size: 16px; color: var(--vb-gray); }
.hero-btn { margin-top: 30px; display: inline-flex; text-decoration: none; }
.catalog { max-width: 1240px; margin: 0 auto; padding: 0 20px; }
.catalog-title { margin: 0 0 30px; font-size: 28px; font-weight: 800; border-bottom: 1px solid var(--vb-line); padding-bottom: 20px; }
.catalog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.photographer-card { background: #fff; border: 1px solid var(--vb-line); border-radius: 4px; overflow: hidden; text-decoration: none; color: inherit; transition: box-shadow 0.2s; }
.photographer-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.card-thumb { width: 100%; aspect-ratio: 4/3; background: #f5f5f5; overflow: hidden; }
.card-info { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border-top: 1px solid var(--vb-line); }
.info-left { display: flex; flex-direction: column; gap: 4px; }
.name { font-size: 16px; font-weight: 700; }
.city { font-size: 13px; color: var(--vb-gray); }
.genres { font-size: 13px; color: var(--vb-gray); }
.price { font-size: 14px; font-weight: 700; color: var(--vb-burgundy); white-space: nowrap; }
.status { text-align: center; padding: 40px; color: var(--vb-gray); }
@media (max-width: 960px) { .catalog-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .catalog-grid { grid-template-columns: 1fr; } }
</style>