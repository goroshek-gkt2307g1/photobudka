import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { API } from '@/services/api';

interface User {
    id: number;
    email: string;
    name: string;
    role_id_FK: number;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref('');

    const isAuthenticated = computed(() => !!user.value);
    const isPhotographer = computed(() => user.value?.role_id_FK === 1);
    const isCustomer = computed(() => user.value?.role_id_FK === 2);

    async function login(email: string, password: string) {
        loading.value = true;
        error.value = '';
        try {
            await API.auth.login({ email, password });
            await fetchCurrentUser();
        } catch (e) {
            error.value = (e as Error).message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function register(data: {
        email: string;
        password: string;
        name: string;
        role: 'photographer' | 'customer';
    }) {
        loading.value = true;
        error.value = '';
        try {
            await API.users.register(data);
            await login(data.email, data.password);
        } catch (e) {
            error.value = (e as Error).message;
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function fetchCurrentUser() {
        try {
            user.value = await API.users.getCurrentUser();
        } catch {
            user.value = null;
        }
    }

    async function logout() {
        await API.auth.logout();
        user.value = null;
    }

    return {
        user,
        loading,
        error,
        isAuthenticated,
        isPhotographer,
        isCustomer,
        login,
        register,
        fetchCurrentUser,
        logout
    };
});