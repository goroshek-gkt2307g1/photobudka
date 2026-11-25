<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const photographerId = Number(route.params.id);

const profile = ref<any>(null);
const loading = ref(true);
const error = ref('');

const name = ref(auth.user?.name || '');
const contact = ref(auth.user?.email || '');
const desiredDate = ref('');
const genre = ref('');
const comment = ref('');
const isSending = ref(false);

onMounted(async () => {
    try {
        const allProfiles = await API.profiles.getAll();
        profile.value = allProfiles.find((p: any) => p.user_id_FK === photographerId);
        if (!profile.value) error.value = 'Фотограф не найден';
    } finally { loading.value = false; }
});

async function submitRequest() {
    isSending.value = true;
    try {
        await API.requests.create({
            photographer_id: profile.value.id,
            name: name.value,
            contact: contact.value,
            desired_date: desiredDate.value,
            genre: genre.value,
            comment: comment.value
        });
        alert('Заявка отправлена!');
        // Если это фотограф — кидаем в его профиль, иначе — в дашборд заказчика
        if (auth.isPhotographer) {
            router.push(`/profile/${auth.user?.id}`);
        } else {
            router.push('/dashboard');
}
    } catch (e) { error.value = (e as Error).message; } finally { isSending.value = false; }
}
</script>

<template>
    <div class="request-wrapper">
        <div v-if="loading" class="status">Загрузка...</div>
        <div v-else-if="error || !profile" class="status error">{{ error || 'Фотограф не найден' }}</div>
        
        <div v-else class="request-card">
            <!-- Шапка -->
            <div class="request-header">
                <h1 class="request-title">Оставить заявку</h1>
                <p class="request-subtitle">
                    Вы оставляете заявку для <strong>{{ profile.photographer_name }}</strong>
                </p>
            </div>

            <!-- Форма -->
            <form @submit.prevent="submitRequest" class="request-form">
                <div class="form-group">
                    <label class="form-label" for="name">Ваше имя</label>
                    <input id="name" v-model="name" type="text" class="vb-input" required />
                </div>

                <div class="form-group">
                    <label class="form-label" for="contact">Контакт (телефон или email)</label>
                    <input id="contact" v-model="contact" type="text" class="vb-input" required />
                </div>

                <div class="form-group">
                    <label class="form-label" for="date">Желаемая дата</label>
                    <input id="date" v-model="desiredDate" type="date" class="vb-input" />
                </div>

                <div class="form-group">
                    <label class="form-label" for="genre">Жанр съемки</label>
                    <input id="genre" v-model="genre" type="text" class="vb-input" placeholder="Свадьба, портрет..." />
                </div>

                <div class="form-group">
                    <label class="form-label" for="comment">Комментарий</label>
                    <textarea id="comment" v-model="comment" class="vb-input textarea" rows="4" placeholder="Расскажите о задаче: место, количество гостей, пожелания"></textarea>
                </div>

                <button type="submit" class="t-btnflex submit-btn" :disabled="isSending">
                    {{ isSending ? 'Отправка...' : 'Отправить заявку' }}
                </button>
                
                <p class="form-footnote">
                    Нажимая кнопку, вы соглашаетесь с правилами сервиса
                </p>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Обертка */
.request-wrapper {
    background: var(--vb-bg);
    min-height: calc(100vh - 80px);
    padding: 80px 20px;
    display: flex;
    justify-content: center;
}

/* Карточка */
.request-card {
    background: #fff;
    border: 1px solid var(--vb-line);
    border-radius: 6px;
    padding: 40px;
    width: 100%;
    max-width: 600px;
    align-self: flex-start;
}

/* Шапка */
.request-header {
    text-align: center;
    margin-bottom: 32px;
}

.request-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px;
    color: var(--vb-black);
    letter-spacing: -0.02em;
}

.request-subtitle {
    font-size: 16px;
    color: var(--vb-gray);
    margin: 0;
    line-height: 1.55;
}

.request-subtitle strong {
    color: var(--vb-burgundy);
}

/* Форма */
.request-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.form-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--vb-black);
}

.textarea {
    height: auto;
    min-height: 96px;
    padding: 13px 14px;
    resize: vertical;
}

.submit-btn {
    width: 100%;
    margin-top: 8px;
}

.form-footnote {
    margin: 16px 0 0;
    font-size: 13px;
    color: var(--vb-gray);
    text-align: center;
}

/* Статусы */
.status {
    text-align: center;
    padding: 100px;
    font-size: 18px;
    color: var(--vb-gray);
}
.status.error {
    color: #c1121f;
}
</style>