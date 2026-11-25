<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { API } from '@/services/api';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const avatarUrl = ref('');
const errorMsg = ref('');
const successMsg = ref('');
const isLoading = ref(false);

onMounted(() => {
  if (auth.user) {
    name.value = auth.user.name;
    email.value = auth.user.email;
  }
});

const handleSave = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  isLoading.value = true;

  if (!auth.user) {
    errorMsg.value = 'Пользователь не авторизован';
    isLoading.value = false;
    return;
  }

  try {
    // Обновляем имя и email
    await API.users.update(auth.user.id, {
      name: name.value,
      email: email.value
    });

    // Сохраняем аватарку в localStorage (для заказчика)
    if (avatarUrl.value) {
      localStorage.setItem('user_avatar_' + auth.user.id, avatarUrl.value);
    }

    successMsg.value = 'Данные успешно обновлены!';
    
    // Обновляем данные в сторе
    await auth.fetchCurrentUser();

    // Через 1.5 секунды возвращаемся в кабинет
    setTimeout(() => router.push('/dashboard'), 1500);

  } catch (e: any) {
    errorMsg.value = e.message || 'Ошибка сохранения';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => router.push('/dashboard');
</script>

<template>
  <div class="settings-wrapper">
    <div class="settings-card">
      <h1 class="settings-title">Настройки аккаунта</h1>

      <form @submit.prevent="handleSave" class="settings-form">
        <!-- Имя -->
        <div class="form-group">
          <label class="form-label" for="name">Имя</label>
          <input id="name" v-model="name" type="text" class="vb-input" placeholder="Ваше имя" required />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input id="email" v-model="email" type="email" class="vb-input" placeholder="you@example.com" required />
        </div>

        <!-- Аватар (URL) -->
        <div class="form-group">
          <label class="form-label" for="avatar">Аватар (ссылка на картинку)</label>
          <input id="avatar" v-model="avatarUrl" type="url" class="vb-input" placeholder="https://example.com/avatar.jpg" />
          <span class="hint">Вставьте ссылку на изображение</span>
          <div v-if="avatarUrl" class="avatar-preview">
            <img :src="avatarUrl" alt="Аватар" />
          </div>
        </div>

        <!-- Заглушка для смены пароля (безопасно) -->
        <div class="divider"></div>
        <p class="section-subtitle">Смена пароля временно недоступна (требуется доработка API)</p>

        <!-- Сообщения -->
        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-box">{{ successMsg }}</div>

        <!-- Кнопки -->
        <div class="actions">
          <button type="button" class="t-btnflex cancel-btn" @click="goBack">Отмена</button>
          <button type="submit" class="t-btnflex submit-btn" :disabled="isLoading">
            {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.settings-wrapper { display: flex; justify-content: center; padding: 60px 20px; background: var(--vb-bg); min-height: calc(100vh - 80px); }
.settings-card { width: 100%; max-width: 600px; background: #fff; border: 1px solid var(--vb-line); border-radius: 6px; padding: 40px; }
.settings-title { margin: 0 0 28px; font-size: 28px; font-weight: 800; text-align: center; }

.form-group { margin-bottom: 18px; }
.form-label { display: block; margin-bottom: 7px; font-size: 14px; font-weight: 600; color: var(--vb-black); }
.hint { display: block; margin-top: 6px; font-size: 13px; color: var(--vb-gray); }

.avatar-preview { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; margin-top: 10px; background: #e4e4e4; }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

.divider { height: 1px; background: var(--vb-line); margin: 24px 0; }
.section-subtitle { margin: 0 0 16px; font-size: 14px; color: var(--vb-gray); }

.actions { display: flex; gap: 12px; margin-top: 24px; }
.cancel-btn { background: #fff; color: var(--vb-black); border: 1px solid var(--vb-line); flex: 1; }
.cancel-btn:hover { background: #f0f0f0; }
.submit-btn { flex: 1; }

.error-box { margin-bottom: 14px; padding: 10px 14px; border: 1px solid #f0c4c4; background: #fdf1f1; border-radius: 4px; color: #b3261e; font-size: 14px; }
.success-box { margin-bottom: 14px; padding: 10px 14px; border: 1px solid #cfe9d9; background: #eefaf3; border-radius: 4px; color: #0d6b3f; font-size: 14px; }
</style>Ы