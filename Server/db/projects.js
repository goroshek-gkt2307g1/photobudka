const { getDb } = require('./db');

const TABLE_NAME = 'Projects';

module.exports = {
    TABLE_NAME,
    addProject: async (profileId, title, description, genre, shootDate, isPrivate, accessPassword, coverPhotoUrl) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} 
             (profile_id_FK, title, description, genre, shoot_date, is_private, access_password, cover_photo_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            profileId, title, description, genre, shootDate, isPrivate, accessPassword, coverPhotoUrl
        );
        return { id: result.lastID, profile_id_FK: profileId, title };
    },
    // Получить ВСЕ проекты профиля (для самого фотографа)
    getAllProjectsByProfile: async (profileId) => await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE profile_id_FK = ? ORDER BY created_at DESC`,
        profileId
    ),
    getProjects: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),
    getProjectById: async (id) => await getDb().get(
        // Добавляем JOIN, чтобы знать, какому юзеру принадлежит проект
        `SELECT p.*, pr.user_id_FK 
         FROM ${TABLE_NAME} p 
         JOIN Profiles pr ON p.profile_id_FK = pr.id 
         WHERE p.id = ?`, id
    ),
    getProjectsByProfile: async (profileId) => await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE profile_id_FK = ?`, profileId
    ),
    getPublicProjects: async () => await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE is_private = 0`
    ),
    updateProject: async (id, data) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} 
             SET title = ?, description = ?, genre = ?, shoot_date = ?, 
                 is_private = ?, access_password = ?, cover_photo_url = ? 
             WHERE id = ?`,
            data.title, data.description, data.genre, data.shoot_date,
            data.is_private, data.access_password, data.cover_photo_url, id
        );
    },
    deleteProject: async (id) => {
        await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
    },
};