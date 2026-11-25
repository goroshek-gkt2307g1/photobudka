const { getDb } = require('./db');

const TABLE_NAME = 'Users';

module.exports = {
    TABLE_NAME,

    getUserByEmail: async (email) => {
        return await getDb().get(
            `SELECT * FROM ${TABLE_NAME} WHERE email = ?`,
            email
        );
    },

    addUser: async (email, password_hash, roleId, name) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (email, password_hash, role_id_FK, name) 
             VALUES (?, ?, ?, ?)`,
            email, password_hash, roleId, name
        );
        return { id: result.lastID, email, name, role_id_FK: roleId };
    },

    getUsers: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),

    getUserById: async (id) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
    ),

    updateUser: async (id, data) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} SET email = ?, name = ?, updated_at = datetime('now') WHERE id = ?`,
            data.email, data.name, id
        );
    },

    deactivateUser: async (id) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
            id
        );
    },

    deleteUser: async (id) => {
        await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
    },
};