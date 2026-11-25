<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { API } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const auth = useAuthStore();
const project = ref<any>(null);
const photos = ref<any[]>([]);
const loading = ref(true);
const uploadLoading = ref(false);

// === Состояния для модалки загрузки ===
const isUploadModalOpen = ref(false);
const isDraggingFiles = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// === Состояния для выбора и удаления ===
const selectedPhotos = ref<number[]>([]);

// Выбрать/снять все
const isAllSelected = computed(() => {
  return photos.value.length > 0 && selectedPhotos.value.length === photos.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedPhotos.value = [];
  } else {
    selectedPhotos.value = photos.value.map(p => p.id);
  }
};

// === Состояния для лайтбокса ===
const lightboxIndex = ref<number | null>(null);
const isLightboxOpen = computed(() => lightboxIndex.value !== null);

// Проверка, является ли текущий пользователь владельцем
const isOwner = computed(() => {
  return auth.isAuthenticated && auth.user?.id === project.value?.user_id_FK;
});

// === Загрузка проекта ===
const loadProject = async () => {
  try {
    const id = Number(route.params.id);
    project.value = await API.projects.getById(id);
    photos.value = await API.photos.getByProject(id);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadProject();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

// === Логика Лайтбокса ===
const openLightbox = (index: number) => {
  lightboxIndex.value = index;
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightboxIndex.value = null;
  document.body.style.overflow = '';
};

const nextPhoto = () => {
  if (lightboxIndex.value === null) return;
  lightboxIndex.value = (lightboxIndex.value + 1) % photos.value.length;
};

const prevPhoto = () => {
  if (lightboxIndex.value === null) return;
  lightboxIndex.value = (lightboxIndex.value - 1 + photos.value.length) % photos.value.length;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!isLightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextPhoto();
  if (e.key === 'ArrowLeft') prevPhoto();
};

// === Логика выбора и удаления ===
const togglePhotoSelection = (photoId: number, event: Event) => {
  event.stopPropagation();
  if (selectedPhotos.value.includes(photoId)) {
    selectedPhotos.value = selectedPhotos.value.filter(id => id !== photoId);
  } else {
    selectedPhotos.value.push(photoId);
  }
};

const deleteSelectedPhotos = async () => {
  if (!confirm(`Удалить выбранные фото (${selectedPhotos.value.length})?`)) return;
  
  try {
    for (const id of selectedPhotos.value) {
      await API.photos.delete(id);
    }
    photos.value = await API.photos.getByProject(project.value.id);
    selectedPhotos.value = [];
  } catch (e: any) {
    alert('Ошибка при удалении: ' + (e.message || 'неизвестная ошибка'));
  }
};

// === Логика загрузки файлов (Модалка) ===
const openUploadModal = () => {
  isUploadModalOpen.value = true;
};

const closeUploadModal = () => {
  isUploadModalOpen.value = false;
  isDraggingFiles.value = false;
  if (fileInput.value) fileInput.value.value = '';
};

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  uploadFiles(target.files);
};

const onDropFiles = (e: DragEvent) => {
  e.preventDefault();
  isDraggingFiles.value = false;
  uploadFiles(e.dataTransfer?.files || null);
};

const uploadFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;

  const list = Array.from(files).slice(0, 50);
  const dt = new DataTransfer();
  list.forEach(f => dt.items.add(f));

  uploadLoading.value = true;
  try {
    await API.photos.upload(project.value.id, dt.files);
    photos.value = await API.photos.getByProject(project.value.id);
    closeUploadModal();
  } catch (e: any) {
    alert('Ошибка загрузки: ' + (e.message || 'неизвестная ошибка'));
  } finally {
    uploadLoading.value = false;
  }
};
</script>

<template>
  <div v-if="loading" class="status">Загрузка...</div>
  
  <div v-else-if="project" class="project-wrapper">
    <!-- Шапка -->
    <div class="project-header">
      <h1 class="title">{{ project.title }}</h1>
      <p class="meta">{{ project.shoot_date }} · {{ project.genre }}</p>
      <p class="desc">{{ project.description }}</p>

      <!-- Кнопки управления -->
      <div v-if="isOwner" class="owner-actions">
        <RouterLink :to="`/project/${project.id}/edit`" class="t-btnflex outline-btn">
          Редактировать проект
        </RouterLink>
        <button class="t-btnflex outline-btn" @click="openUploadModal">
          Добавить фото
        </button>
      </div>
    </div>

    <!-- Панель управления массовым выделением и удалением -->
    <div v-if="isOwner && photos.length > 0" class="select-all-bar">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="isAllSelected" 
          @change="toggleSelectAll"
          class="photo-check"
          style="position: static; margin-right: 8px;"
        />
        Выбрать все фото
      </label>

      <div v-if="selectedPhotos.length > 0" class="delete-actions">
        <span>Выбрано: <strong>{{ selectedPhotos.length }}</strong></span>
        <button @click="deleteSelectedPhotos" class="delete-btn">Удалить</button>
      </div>
    </div>

    <!-- Сетка фото -->
    <div class="gallery-grid">
      <div 
        v-for="(photo, index) in photos" 
        :key="photo.id" 
        class="photo-item"
        @click="openLightbox(index)"
      >
        <img :src="photo.file_path" alt="Фото" draggable="false" />
        
        <!-- Чекбокс выбора -->
        <input 
          v-if="isOwner"
          type="checkbox" 
          class="photo-check" 
          :checked="selectedPhotos.includes(photo.id)"
          @click="(e) => togglePhotoSelection(photo.id, e)"
        />
      </div>
    </div>

    <div v-if="photos.length === 0" class="empty">
      В проекте пока нет фотографий.
    </div>
  </div>

  <!-- === МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ === -->
  <div v-if="isUploadModalOpen" class="upload-modal-overlay" @click.self="closeUploadModal">
    <div class="upload-modal">
      <button class="modal-close" @click="closeUploadModal">×</button>
      
      <div 
        class="drop-zone"
        :class="{ 'is-dragging': isDraggingFiles }"
        @dragover.prevent="isDraggingFiles = true"
        @dragleave.prevent="isDraggingFiles = false"
        @drop="onDropFiles"
      >
        <div class="drop-zone-content">
          <!-- Иконка облака с идеальными пропорциями -->
          <svg class="cloud-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.0147 19.9853 10 17.5 10C17.4543 10 17.4088 10.0007 17.3636 10.0022C16.8829 7.16229 14.4077 5 11.5 5C8.18629 5 5.5 7.68629 5.5 11C5.5 11.2223 5.51217 11.4418 5.53582 11.6579C3.52414 12.0823 2 13.8591 2 16C2 18.2091 3.79086 20 6 20H17.5Z" fill="#A3E6A3" stroke="#333" stroke-width="1.5"/>
            <path d="M12 15V10M12 10L9.5 12.5M12 10L14.5 12.5" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <input 
            type="file" 
            ref="fileInput" 
            multiple 
            accept="image/*" 
            style="display: none" 
            @change="onFileSelect"
          />
          
          <button type="button" class="t-btnflex browse-btn" @click="fileInput?.click()">
            {{ uploadLoading ? 'Загрузка...' : 'Обзор' }}
          </button>
          
          <p class="drop-hint">или перетащите файлы для загрузки и выберите</p>
        </div>
      </div>
    </div>
  </div>

  <!-- === ЛАЙТБОКС === -->
  <div v-if="isLightboxOpen" class="lightbox" @click.self="closeLightbox">
    <button class="lb-close" @click="closeLightbox">×</button>
    <button class="lb-prev" @click.stop="prevPhoto">‹</button>
    <button class="lb-next" @click.stop="nextPhoto">›</button>
    <div class="lb-content" @click.stop>
      <img :src="photos[lightboxIndex!]?.file_path" alt="Просмотр" draggable="false" />
      <div class="lb-counter">{{ lightboxIndex! + 1 }} / {{ photos.length }}</div>
    </div>
  </div>
</template>

<style scoped>
.project-wrapper { max-width: 1240px; margin: 0 auto; padding: 60px 20px; background: #fff; min-height: 100vh; }

.project-header { padding-bottom: 30px; border-bottom: 1px solid var(--vb-line); margin-bottom: 30px; }
.title { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
.meta { margin: 10px 0 0; font-size: 14px; color: var(--vb-gray); }
.desc { margin: 14px 0 0; font-size: 15px; color: var(--vb-gray); line-height: 1.6; max-width: 70ch; }

.owner-actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
.outline-btn { background: #fff; color: var(--vb-burgundy); border: 1px solid var(--vb-burgundy); height: 40px; padding: 0 20px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; }
.outline-btn:hover { background: var(--vb-burgundy); color: #fff; }

/* Панель массового выделения */
.select-all-bar { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 12px 16px; background: #fafafa; border: 1px solid var(--vb-line); 
  border-radius: 4px; margin-bottom: 20px;
}
.checkbox-label { display: flex; align-items: center; cursor: pointer; font-weight: 600; font-size: 14px; }
.delete-actions { display: flex; align-items: center; gap: 16px; font-size: 14px; }
.delete-btn { background: var(--vb-burgundy); color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer; }
.delete-btn:hover { background: var(--vb-burgundy-deep); }

.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.photo-item { position: relative; aspect-ratio: 1/1; background: #f0f0f0; border-radius: 4px; overflow: hidden; cursor: pointer; }
.photo-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.2s; user-select: none; }
.photo-item:hover img { transform: scale(1.03); }

.photo-check { position: absolute; top: 10px; left: 10px; width: 20px; height: 20px; cursor: pointer; accent-color: var(--vb-burgundy); z-index: 2; }

.empty { padding: 40px; text-align: center; color: var(--vb-gray); background: #fafafa; border-radius: 4px; }
.status { text-align: center; padding: 80px; }

/* === МОДАЛКА ЗАГРУЗКИ === */
.upload-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 20px;
}
.upload-modal {
  background: #fff; border-radius: 8px; width: 100%; max-width: 600px;
  padding: 30px; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  animation: fadeIn 0.2s ease;
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; font-size: 24px; color: #666; cursor: pointer;
  line-height: 1;
}
.modal-close:hover { color: #000; }

.drop-zone {
  border: 2px dashed #ccc; border-radius: 8px;
  padding: 40px 20px; text-align: center;
  transition: all 0.2s; background: #fafafa;
}
.drop-zone.is-dragging { border-color: #4285f4; background: #e8f0fe; }

/* Обертка для центрирования контента внутри зоны */
.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px; /* Отступы между облаком, кнопкой и текстом */
}

.cloud-icon { width: 80px; height: 80px; }

.browse-btn {
  background: #4285f4; color: white; border: none;
  padding: 10px 32px; border-radius: 24px; font-weight: 600;
  cursor: pointer; font-size: 15px;
  transition: background 0.2s;
}
.browse-btn:hover { background: #3367d6; }
.drop-hint { font-size: 14px; color: #555; margin: 0; }

/* === ЛАЙТБОКС === */
.lightbox {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000;
  display: flex; align-items: center; justify-content: center;
}
.lb-content { max-width: 90vw; max-height: 90vh; position: relative; }
.lb-content img { max-width: 90vw; max-height: 85vh; object-fit: contain; border-radius: 4px; user-select: none; }
.lb-counter { position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; }
.lb-close, .lb-prev, .lb-next {
  position: absolute; background: rgba(255,255,255,0.1); border: none;
  color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; z-index: 2;
}
.lb-close:hover, .lb-prev:hover, .lb-next:hover { background: rgba(255,255,255,0.25); }
.lb-close { top: 20px; right: 20px; width: 48px; height: 48px; border-radius: 50%; font-size: 32px; line-height: 1; }
.lb-prev, .lb-next { top: 50%; transform: translateY(-50%); width: 56px; height: 56px; border-radius: 50%; font-size: 40px; line-height: 1; }
.lb-prev { left: 20px; }
.lb-next { right: 20px; }

@media (max-width: 960px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .lb-prev, .lb-next { width: 40px; height: 40px; font-size: 28px; }
  .lb-prev { left: 8px; }
  .lb-next { right: 8px; }
  .lb-close { top: 8px; right: 8px; width: 40px; height: 40px; font-size: 24px; }
}
</style>