<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { API } from '@/services/api';

const auth = useAuthStore();
const router = useRouter();

const city = ref('');
const genres = ref('');
const priceHour = ref<number | null>(null);
const description = ref('');
const avatarUrl = ref(''); // Сюда сохраняем путь к аватару
const errorMsg = ref('');
const isLoading = ref(false);

// Для выбора файла из проводника
const avatarInput = ref<HTMLInputElement | null>(null);
const isUploadingAvatar = ref(false);

const triggerAvatarUpload = () => avatarInput.value?.click();

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingAvatar.value = true;
  try {
    // 1. Находим профиль пользователя
    const profiles = await API.profiles.getAll();
    const myProfile = profiles.find((p: any) => p.user_id_FK === auth.user?.id);
    if (!myProfile) throw new Error('Профиль не найден');

    // 2. Находим любой проект этого пользователя (чтобы загрузить туда файл)
    const projects = await API.projects.getByProfile(myProfile.id);
    if (projects.length === 0) {
      throw new Error('Для загрузки аватара создайте хотя бы один проект');
    }
    const projectId = projects[0].id;

    // 3. Загружаем файл
    const dt = new DataTransfer();
    dt.items.add(file);
    const uploaded = await API.photos.upload(projectId, dt.files);

    if (uploaded && uploaded.length > 0) {
      avatarUrl.value = uploaded[0].file_path;
    }
  } catch (e: any) {
    alert('Ошибка загрузки аватара: ' + (e.message || 'неизвестная ошибка'));
  } finally {
    isUploadingAvatar.value = false;
  }
};

onMounted(async () => {
  if (!auth.user) return;
  try {
    const profiles = await API.profiles.getAll();
    const myProfile = profiles.find((p: any) => p.user_id_FK === auth.user?.id);
    if (myProfile) {
      city.value = myProfile.city || '';
      genres.value = myProfile.genres || '';
      priceHour.value = myProfile.price_hour || null;
      description.value = myProfile.description || '';
      avatarUrl.value = myProfile.avatar_url || '';
    }
  } catch (e) {
    console.error(e);
  }
});

const handleSave = async () => {
  errorMsg.value = '';
  isLoading.value = true;
  
  if (!auth.user) return;

  try {
    const profiles = await API.profiles.getAll();
    const myProfile = profiles.find((p: any) => p.user_id_FK === auth.user?.id);

    if (myProfile) {
      await API.profiles.update(myProfile.id, {
        city: city.value,
        genres: genres.value,
        price_hour: priceHour.value || 0,
        description: description.value,
        avatar_url: avatarUrl.value
      });
    } else {
      await API.profiles.create({
        city: city.value,
        genres: genres.value,
        price_hour: priceHour.value || 0,
        description: description.value,
        avatar_url: avatarUrl.value
      });
    }
    if (auth.isPhotographer) {
      router.push(`/profile/${auth.user.id}`);
    } else {
      router.push('/dashboard');
    }
  } catch (e: any) {
    errorMsg.value = e.message || 'Ошибка сохранения';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="edit-wrapper">
    <div class="edit-card">
      <h1 class="edit-title">Настройка профиля</h1>
      
      <form @submit.prevent="handleSave" class="edit-form">
        <div class="form-group">
          <label class="form-label" for="city">Город</label>
          <input id="city" v-model="city" type="text" class="vb-input" placeholder="Москва" />
        </div>

        <div class="form-group">
          <label class="form-label" for="genres">Жанры</label>
          <input id="genres" v-model="genres" type="text" class="vb-input" placeholder="Свадьба, Портрет, Репортаж" />
          <span class="hint">Перечислите через запятую</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="price">Цена за час</label>
          <input id="price" v-model="priceHour" type="number" class="vb-input" placeholder="3500" />
          <span class="hint">Укажите сумму в рублях</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="desc">Описание</label>
          <textarea id="desc" v-model="description" class="vb-input textarea" rows="4" placeholder="Расскажите о себе, своём подходе и опыте съёмок..."></textarea>
        </div>

        <!-- Блок аватара -->
        <div class="form-group">
          <span class="form-label">Аватар</span>
          <div class="avatar-upload">
            <div v-if="avatarUrl" class="avatar-preview">
              <img :src="avatarUrl" alt="Аватар" />
            </div>
            <div v-else class="avatar-placeholder"></div>
            
            <div class="avatar-actions">
              <input type="file" ref="avatarInput" accept="image/*" style="display: none" @change="handleAvatarUpload" />
              <button type="button" class="file-btn" @click="triggerAvatarUpload" :disabled="isUploadingAvatar">
                 {{ isUploadingAvatar ? 'Загрузка...' : 'Загрузить аватар' }}
              </button>
              <span class="hint">JPG или PNG, до 5 МБ</span>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

        <button type="submit" class="t-btnflex submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Сохранение...' : 'Сохранить профиль' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-wrapper { display: flex; justify-content: center; padding: 80px 20px; background: var(--vb-bg); min-height: calc(100vh - 80px); }
.edit-card { width: 100%; max-width: 600px; background: #fff; border: 1px solid var(--vb-line); border-radius: 6px; padding: 40px; }
.edit-title { margin: 0 0 28px; font-size: 28px; font-weight: 800; text-align: center; letter-spacing: -0.02em; }
.form-group { margin-bottom: 18px; }
.form-label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: 600; color: var(--vb-black); }
.hint { display: block; margin-top: 6px; font-size: 13px; color: var(--vb-gray); }
.textarea { height: auto; min-height: 110px; padding: 13px 14px; resize: vertical; }

/* Стили аватара */
.avatar-upload { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--vb-field); border-radius: 4px; }
.avatar-preview { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; flex: none; }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-placeholder { width: 64px; height: 64px; border-radius: 50%; background: #e4e4e4; flex: none; }
.avatar-actions { display: flex; flex-direction: column; gap: 6px; }
.file-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: #fff; border: 1px solid var(--vb-burgundy); border-radius: 4px; color: var(--vb-burgundy); font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.file-btn:hover { background: var(--vb-burgundy); color: #fff; }
.file-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.submit-btn { width: 100%; margin-top: 10px; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error-box { margin-bottom: 14px; padding: 10px 14px; border: 1px solid #f0c4c4; background: #fdf1f1; border-radius: 4px; color: #b3261e; font-size: 14px; }
</style>