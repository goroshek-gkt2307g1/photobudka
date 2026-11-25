import type { LoginData, RegistrationData, ProfileData, ProjectData, RequestData } from './types';


// ============ БАЗОВЫЙ URL ============

export const BASE_URL = '/api';

// ============ ОБРАБОТКА ОШИБОК ============

const errorHandler = async (response: Response) => {
    if (!response.ok) {
        const responseData = await response.json().catch(() => ({
            message: 'Ошибка сервера'
        }));
        throw Error(responseData.message || 'Ошибка сервера');
    }
};

// Проверка, есть ли у пользователя кука с токеном
export const hasAuthToken = (): boolean => {
    return document.cookie.split(';').some((item) => item.trim().startsWith('token='));
};

// ============ API ============

export const API = {
    // ---------- Авторизация ----------
    auth: {
        login: async (data: LoginData) => {
            const response = await fetch(`${BASE_URL}/auth`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
        },
        logout: async () => {
            const response = await fetch(`${BASE_URL}/auth`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await errorHandler(response);
        }
    },

    // ---------- Пользователи ----------
    users: {
        register: async (data: RegistrationData) => {
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
            return await response.json();
        },
        getCurrentUser: async () => {
            const response = await fetch(`${BASE_URL}/users/me`, {
                method: 'GET',
                credentials: 'include'
            });
            await errorHandler(response);
            return await response.json();
        },
        update: async (id: number, data: { name: string; email: string }) => {
            const response = await fetch(`${BASE_URL}/users/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
        }
    },

    // ---------- Профили фотографов ----------
    profiles: {

        getAll: async () => {
            const response = await fetch(`${BASE_URL}/profiles`);
            await errorHandler(response);
            return await response.json();
        },
        search: async (city?: string, genre?: string, maxPrice?: number) => {
            const params = new URLSearchParams();
            if (city) params.append('city', city);
            if (genre) params.append('genre', genre);
            if (maxPrice) params.append('maxPrice', maxPrice.toString());

            const response = await fetch(`${BASE_URL}/profiles/search?${params}`);
            await errorHandler(response);
            return await response.json();
        },
        getById: async (id: number) => {
            const response = await fetch(`${BASE_URL}/profiles/${id}`);
            await errorHandler(response);
            return await response.json();
        },
        create: async (data: ProfileData) => {
            const response = await fetch(`${BASE_URL}/profiles`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
            return await response.json();
        },
        update: async (id: number, data: ProfileData) => {
            const response = await fetch(`${BASE_URL}/profiles/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
        },
        delete: async (id: number) => {
            const response = await fetch(`${BASE_URL}/profiles/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await errorHandler(response);
        }
    },

    // ---------- Проекты ----------
    projects: {
        // ДОБАВЬ ВОТ ЭТОТ БЛОК:
        getAllByProfile: async (profileId: number) => {
            const response = await fetch(`${BASE_URL}/projects/profile/${profileId}/all`);
            await errorHandler(response);
            return await response.json();
        },

        // ... остальные методы (getById, create и т.д.)
        getPublic: async () => {
            const response = await fetch(`${BASE_URL}/projects`);
            await errorHandler(response);
            return await response.json();
        },
        getByProfile: async (profileId: number) => {
            const response = await fetch(`${BASE_URL}/projects/profile/${profileId}`);
            await errorHandler(response);
            return await response.json();
        },
        getById: async (id: number) => {
            const response = await fetch(`${BASE_URL}/projects/${id}`);
            await errorHandler(response);
            return await response.json();
        },
        create: async (data: ProjectData) => {
            const response = await fetch(`${BASE_URL}/projects`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
            return await response.json();
        },
        update: async (id: number, data: Partial<ProjectData>) => {
            const response = await fetch(`${BASE_URL}/projects/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
        },
        delete: async (id: number) => {
            const response = await fetch(`${BASE_URL}/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await errorHandler(response);
        },
        accessPrivate: async (id: number, password: string) => {
            const response = await fetch(`${BASE_URL}/projects/${id}/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            await errorHandler(response);
        }
    },

    // ---------- Фотографии ----------
    photos: {
        getByProject: async (projectId: number) => {
            const response = await fetch(`${BASE_URL}/photos/project/${projectId}`);
            await errorHandler(response);
            return await response.json();
        },
        upload: async (projectId: number, files: FileList) => {
            const formData = new FormData();
            formData.append('project_id', projectId.toString());

            for (const file of files) {
                formData.append('photos', file);
            }

            const response = await fetch(`${BASE_URL}/photos`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            await errorHandler(response);
            return await response.json();
        },
        delete: async (id: number) => {
            const response = await fetch(`${BASE_URL}/photos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await errorHandler(response);
        }
    },

    // ---------- Заявки ----------
    requests: {
        getByPhotographer: async (photographerId: number) => {
            const response = await fetch(`${BASE_URL}/requests/photographer/${photographerId}`);
            await errorHandler(response);
            return await response.json();
        },
        getByCustomer: async (customerId: number) => {
            const response = await fetch(`${BASE_URL}/requests/customer/${customerId}`);
            await errorHandler(response);
            return await response.json();
        },
        create: async (data: RequestData) => {
            const response = await fetch(`${BASE_URL}/requests`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await errorHandler(response);
            return await response.json();
        },
        updateStatus: async (id: number, status: string) => {
            const response = await fetch(`${BASE_URL}/requests/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            await errorHandler(response);
        },
        delete: async (id: number) => {
            const response = await fetch(`${BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            await errorHandler(response);
        }
    }
};