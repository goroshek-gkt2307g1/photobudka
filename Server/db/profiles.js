// Server/db/profiles.js
const { getDb } = require('./db');
const TABLE_NAME = 'Profiles';

module.exports = {
    TABLE_NAME,
    addProfile: async (userId, city, genres, priceHour, description, avatarUrl) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (user_id_FK, city, genres, price_hour, description, avatar_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            userId, city, genres, priceHour, description, avatarUrl
        );
        return { id: result.lastID, user_id_FK: userId, city, genres, price_hour: priceHour };
    },
    getProfiles: async () => await getDb().all(`
        SELECT p.*, u.name AS photographer_name 
        FROM ${TABLE_NAME} p 
        JOIN Users u ON p.user_id_FK = u.id`),
    getProfileById: async (id) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
    ),
    getProfileByUserId: async (userId) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE user_id_FK = ?`, userId
    ),
    updateProfile: async (id, data) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} 
             SET city = ?, genres = ?, price_hour = ?, description = ?, avatar_url = ? 
             WHERE id = ?`,
            data.city, data.genres, data.price_hour, data.description, data.avatar_url, id
        );
    },
    searchProfiles: async (city, genre, maxPrice) => {
        let query = `SELECT p.*, u.name AS photographer_name 
                     FROM ${TABLE_NAME} p 
                     JOIN Users u ON p.user_id_FK = u.id 
                     WHERE 1=1`;
        const params = [];
        if (city) { query += ` AND p.city = ?`; params.push(city); }
        if (genre) { query += ` AND p.genres LIKE ?`; params.push(`%${genre}%`); }
        if (maxPrice) { query += ` AND p.price_hour <= ?`; params.push(maxPrice); }
        return await getDb().all(query, ...params);
    },
    deleteProfile: async (id) => {
        await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
    },
};