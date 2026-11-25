<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const passwordRepeat = ref('');
const role = ref<'photographer' | 'customer'>('customer');
const agree = ref(false);
const errorMsg = ref('');

const handleRegister = async () => {
  errorMsg.value = '';
  if (password.value !== passwordRepeat.value) {
    errorMsg.value = 'Пароли не совпадают';
    return;
  }
  if (!agree.value) {
    errorMsg.value = 'Необходимо согласие на обработку данных';
    return;
  }
  
  try {
    await auth.register({
      email: email.value,
      password: password.value,
      name: name.value,
      role: role.value
    });
    router.push('/dashboard');
  } catch (e: any) {
    errorMsg.value = e.message || 'Ошибка регистрации';
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Создать аккаунт</h1>
      <p class="auth-subtitle">Фотограф или заказчик — регистрация занимает минуту</p>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="name">Имя</label>
          <input id="name" v-model="name" type="text" class="vb-input" placeholder="Как вас зовут" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input id="email" v-model="email" type="email" class="vb-input" placeholder="you@example.com" required />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Пароль</label>
          <input id="password" v-model="password" type="password" class="vb-input" placeholder="Минимум 8 символов" required minlength="8" />
        </div>

        <div class="form-group">
          <label class="form-label" for="passwordRepeat">Повторите пароль</label>
          <input id="passwordRepeat" v-model="passwordRepeat" type="password" class="vb-input" placeholder="Введите пароль ещё раз" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="role">Кто вы?</label>
          <select id="role" v-model="role" class="vb-input">
            <option value="customer">Я ищу фотографа</option>
            <option value="photographer">Я фотограф</option>
          </select>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="agree" v-model="agree" class="checkbox" required />
          <label for="agree" class="checkbox-label">
            Я принимаю <a href="#" class="link">правила сервиса</a> и согласен на обработку данных
          </label>
        </div>

        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

        <button type="submit" class="t-btnflex submit-btn">Зарегистрироваться</button>
      </form>
      
      <p class="auth-switch">
        Уже есть аккаунт? <RouterLink to="/login" class="switch-link">Войти</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
  background: var(--vb-bg);
  min-height: calc(100vh - 80px);
}

.auth-card {
  width: 100%;
  max-width: 600px;
  background: #fff;
  border: 1px solid var(--vb-line);
  border-radius: 6px;
  padding: 40px;
}

.auth-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  text-align: center;
}

.auth-subtitle {
  margin: 10px 0 28px;
  font-size: 16px;
  color: var(--vb-gray);
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 7px;
  font-size: 14px;
  font-weight: 600;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: var(--vb-field);
  border-radius: 4px;
}

.checkbox {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  accent-color: var(--vb-burgundy);
}

.checkbox-label {
  font-size: 14px;
  color: var(--vb-gray);
  line-height: 1.4;
}

.link {
  color: var(--vb-burgundy);
  font-weight: 600;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.error-box {
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid #f0c4c4;
  background: #fdf1f1;
  border-radius: 4px;
  color: #b3261e;
  font-size: 14px;
}

.auth-switch {
  margin-top: 22px;
  text-align: center;
  font-size: 14px;
  color: var(--vb-gray);
}

.switch-link {
  color: var(--vb-gray);
  font-weight: 600;
  text-decoration: none;
}

.switch-link:hover {
  color: var(--vb-burgundy);
}
</style>