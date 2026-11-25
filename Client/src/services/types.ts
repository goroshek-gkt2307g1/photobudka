export type LoginData = {
    email: string;
    password: string;
};

export type RegistrationData = {
    email: string;
    password: string;
    name: string;
    role: 'photographer' | 'customer';
};

export type ProfileData = {
    city?: string;
    genres?: string;
    price_hour?: number;
    description?: string;
    avatar_url?: string;
};

export type ProjectData = {
    profile_id: number;
    title: string;
    description?: string;
    genre?: string;
    shoot_date?: string;
    is_private?: boolean;
    access_password?: string;
    cover_photo_url?: string;
};

export type RequestData = {
    photographer_id: number;
    name: string;
    contact: string;
    desired_date?: string;
    genre?: string;
    comment?: string;
};

export interface User {
    id: number;
    email: string;
    name: string;
    role_id_FK: number;
    is_active?: number;
    created_at?: string;
}