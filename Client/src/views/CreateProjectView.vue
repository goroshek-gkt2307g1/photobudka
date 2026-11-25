<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { API } from '@/services/api';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const projectId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditMode = computed(() => !!projectId.value);

const title = ref('');
const description = ref('');
const genre = ref('');
const shootDate = ref('');
const isPrivate = ref(false);
const accessPassword = ref('');
const coverPhotoUrl = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const coverInput = ref<HTMLInputElement | null>(null);
const isUploadingCover = ref(false);

const triggerCoverUpload = () => coverInput.value?.click();

const handleCoverUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!projectId.value) {
    alert('Сначала сохраните проект, затем загружайте обложку.');
    return;
  }

  isUploadingCover.value = true;
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    const uploaded = await API.photos.upload(projectId.value, dt.files);
    if (uploaded && uploaded.length > 0) {
      coverPhotoUrl.value = uploaded[0].file_path;
      // НЕ ОТПРАВЛЯЕМ update() ЗДЕСЬ. Просто сохраняем в переменную.
    }
  } catch (e: any) {
    alert('Ошибка загрузки обложки: ' + (e.message || 'неизвестная ошибка'));
  } finally {
    isUploadingCover.value = false;
  }
};

onMounted(async () => {
  if (isEditMode.value && projectId.value) {
    isLoading.value = true;
    try {
      const project = await API.projects.getById(projectId.value);
      if (project) {
        title.value = project.title || '';
        description.value = project.description || '';
        genre.value = project.genre || '';
        shootDate.value = project.shoot_date || '';
        isPrivate.value = !!project.is_private;
        coverPhotoUrl.value = project.cover_photo_url || '';
      }
    } catch (e: any) {
      errorMsg.value = 'Не удалось загрузить проект';
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }
});

const getProfileId = async () => {
  if (!auth.user) return null;
  try {
    const profiles = await API.profiles.getAll();
    const myProfile = profiles.find((p: any) => p.user_id_FK === auth.user?.id);
    return myProfile ? myProfile.id : null;
  } catch {
    return null;
  }
};

const handleSave = async () => {
  errorMsg.value = '';
  try {
    if (isEditMode.value && projectId.value) {
      await API.projects.update(projectId.value, {
        title: title.value,
        description: description.value,
        genre: genre.value,
        shoot_date: shootDate.value,
        is_private: isPrivate.value,
        access_password: isPrivate.value && accessPassword.value ? accessPassword.value : undefined,
        cover_photo_url: coverPhotoUrl.value
      });
      router.push(`/project/${projectId.value}`);
    } else {
      const profileId = await getProfileId();
      if (!profileId) {
        errorMsg.value = 'У вас нет профиля фотографа. Сначала создайте его.';
        return;
      }
      await API.projects.create({
        profile_id: profileId,
        title: title.value,
        description: description.value,
        genre: genre.value,
        shoot_date: shootDate.value,
        is_private: isPrivate.value,
        access_password: isPrivate.value ? accessPassword.value : undefined,
        cover_photo_url: coverPhotoUrl.value
      });
      router.push(`/profile/${auth.user?.id}`);
    }
  } catch (e: any) {
    errorMsg.value = e.message || 'Ошибка сохранения';
  }
};
</script>

<template>
  <div class="create-wrapper">
    <div class="create-card">
      <h1 class="create-title">
        {{ isEditMode ? 'Редактирование фотосессии' : 'Новая фотосессия' }}
      </h1>
      
      <form @submit.prevent="handleSave" class="create-form">
        <!-- Блок загрузки обложки -->
        <div v-if="isEditMode" class="form-group">
          <span class="form-label">Обложка проекта</span>
          <div class="cover-upload">
            <div v-if="coverPhotoUrl" class="cover-preview">
              <img :src="coverPhotoUrl" alt="Обложка" />
            </div>
            <div v-else class="cover-placeholder">Нет обложки</div>
            <input type="file" ref="coverInput" accept="image/*" style="display: none" @change="handleCoverUpload" />
            <button type="button" class="file-btn" @click="triggerCoverUpload" :disabled="isUploadingCover">
              {{ isUploadingCover ? 'Загрузка...' : 'Загрузить обложку' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label required" for="title">Название проекта</label>
          <input id="title" v-model="title" type="text" class="vb-input" placeholder="Например: Свадьба Марии и Петра" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="desc">Описание</label>
          <textarea id="desc" v-model="description" class="vb-input textarea" rows="3" placeholder="Коротко о съёмке: место, настроение, детали"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="genre">Жанр</label>
          <input id="genre" v-model="genre" type="text" class="vb-input" placeholder="Свадьба, Портрет, Репортаж" />
        </div>

        <div class="form-group">
          <label class="form-label required" for="date">Дата съёмки</label>
          <input id="date" v-model="shootDate" type="date" class="vb-input" required />
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="private" v-model="isPrivate" class="checkbox" />
          <label for="private" class="checkbox-label">Приватный проект (по паролю)</label>
        </div>

        <div v-if="isPrivate" class="form-group">
          <label class="form-label" for="pass">
            {{ isEditMode ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль доступа' }}
          </label>
          <input id="pass" v-model="accessPassword" type="text" class="vb-input" :required="!isEditMode && isPrivate" placeholder="Придумайте пароль для проекта" />
        </div>

        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

        <button type="submit" class="t-btnflex submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Загрузка...' : (isEditMode ? 'Сохранить изменения' : 'Создать проект') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-wrapper { display: flex; justify-content: center; padding: 80px 20px; background: var(--vb-bg); }
.create-card { width: 100%; max-width: 600px; background: #fff; border: 1px solid var(--vb-line); border-radius: 6px; padding: 40px; }
.create-title { margin: 0 0 28px; font-size: 28px; font-weight: 800; text-align: center; }
.form-group { margin-bottom: 18px; }
.form-label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: 600; }
.form-label.required::after { content: " *"; color: var(--vb-burgundy); }
.textarea { height: auto; min-height: 84px; padding: 13px 14px; resize: vertical; }
.checkbox-group { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: var(--vb-field); border-radius: 4px; }
.checkbox { width: 18px; height: 18px; accent-color: var(--vb-burgundy); }
.checkbox-label { font-size: 15px; font-weight: 500; }
.file-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; background: #fff; border: 1px solid var(--vb-burgundy); border-radius: 4px; color: var(--vb-burgundy); font-weight: 600; cursor: pointer; transition: all 0.2s; }
.file-btn:hover { background: var(--vb-burgundy); color: #fff; }
.file-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cover-upload { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--vb-field); border-radius: 4px; }
.cover-preview { width: 100%; aspect-ratio: 16/9; border-radius: 4px; overflow: hidden; }
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; aspect-ratio: 16/9; background: #e4e4e4; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--vb-gray); }
.submit-btn { width: 100%; margin-top: 10px; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.error-box { margin-bottom: 14px; padding: 10px 14px; border: 1px solid #f0c4c4; background: #fdf1f1; border-radius: 4px; color: #b3261e; font-size: 14px; }
</style>