const { getDb } = require('./db');

const TABLE_NAME = 'Photos';

module.exports = {
    TABLE_NAME,
    addPhoto: async (projectId, filePath) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} (project_id_FK, file_path) VALUES (?, ?)`,
            projectId, filePath
        );
        return { id: result.lastID, project_id_FK: projectId, file_path: filePath };
    },
    getPhotos: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),
    getPhotoById: async (id) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
    ),
    getPhotosByProject: async (projectId) => await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE project_id_FK = ?`, projectId
    ),
    deletePhoto: async (id) => {
        await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
    },
};