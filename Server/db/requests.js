const { getDb } = require('./db');

const TABLE_NAME = 'Requests';

module.exports = {
    TABLE_NAME,
    addRequest: async (customerId, photographerId, name, contact, desiredDate, genre, comment) => {
        const result = await getDb().run(
            `INSERT INTO ${TABLE_NAME} 
             (customer_id_FK, photographer_id_FK, name, contact, desired_date, genre, comment) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            customerId, photographerId, name, contact, desiredDate, genre, comment
        );
        return { id: result.lastID };
    },
    getRequests: async () => await getDb().all(`SELECT * FROM ${TABLE_NAME}`),
    getRequestById: async (id) => await getDb().get(
        `SELECT * FROM ${TABLE_NAME} WHERE id = ?`, id
    ),
    getRequestsByPhotographer: async (photographerId) => await getDb().all(
        `SELECT r.*, u.name AS customer_name 
         FROM Requests r 
         LEFT JOIN Users u ON r.customer_id_FK = u.id 
         WHERE r.photographer_id_FK = ? 
         ORDER BY r.created_at DESC`,
        photographerId
    ),
    getRequestsByCustomer: async (customerId) => await getDb().all(
        `SELECT * FROM ${TABLE_NAME} WHERE customer_id_FK = ? ORDER BY created_at DESC`,
        customerId
    ),
    updateRequestStatus: async (id, status) => {
        await getDb().run(
            `UPDATE ${TABLE_NAME} SET status = ? WHERE id = ?`, status, id
        );
    },
    deleteRequest: async (id) => {
        await getDb().run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, id);
    },
};