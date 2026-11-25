const { getDb } = require('./db');

const TABLE_NAME = 'Roles';

module.exports = {
    TABLE_NAME,
    addRole: async (name) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (name) VALUES (?)`, name
        );
        return { id: result.lastID, name };
    },
    getRoles: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),
    getRoleById: async (id) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
    ),
    getRoleByName: async (name) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE name = ?`, name
    ),
};