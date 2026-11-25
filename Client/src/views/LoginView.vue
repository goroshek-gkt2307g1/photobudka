<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMsg = ref('');

const handleLogin = async () => {
  errorMsg.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/dashboard');
  } catch (e: any) {
    errorMsg.value = e.message || 'Ошибка входа';
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Вход в систему</h1>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="vb-input" 
            placeholder="you@example.com" 
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Пароль</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            class="vb-input" 
            placeholder="••••••••" 
            required
          />
        </div>

        <div v-if="errorMsg" class="error-box">{{ errorMsg }}</div>

        <button type="submit" class="t-btnflex submit-btn">Войти</button>
      </form>
      
      <p class="auth-switch">
        Нет аккаунта? <RouterLink to="/register" class="switch-link">Зарегистрироваться</RouterLink>
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
  max-width: 400px;
  background: #fff;
  border: 1px solid var(--vb-line);
  border-radius: 6px;
  padding: 40px 36px;
  align-self: flex-start;
}

.auth-title {
  margin: 0 0 26px;
  font-size: 28px;
  font-weight: 800;
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
  border-bottom: 1px solid var(--vb-burgundy);
}
</style>