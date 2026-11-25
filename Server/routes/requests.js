const express = require('express');
const requestRouter = express.Router();
const {
    addRequest,
    getRequestsByPhotographer,
    getRequestsByCustomer,
    updateRequestStatus,
    deleteRequest
} = require('../db/requests');
const authMiddleware = require('../middleware/auth');

// Входящие заявки фотографа
requestRouter.get('/photographer/:id', authMiddleware, async (req, res) => {
    const requests = await getRequestsByPhotographer(req.params.id);
    res.status(200).json(requests);
});

// Исходящие заявки заказчика
requestRouter.get('/customer/:id', authMiddleware, async (req, res) => {
    const requests = await getRequestsByCustomer(req.params.id);
    res.status(200).json(requests);
});

// Отправить заявку
requestRouter.post('/', authMiddleware, async (req, res) => {
    const request = await addRequest(
        req.userId,
        req.body.photographer_id,
        req.body.name,
        req.body.contact,
        req.body.desired_date,
        req.body.genre,
        req.body.comment
    );

    res.status(200).json(request);
});

// Обновить статус
requestRouter.put('/:id', authMiddleware, async (req, res) => {
    await updateRequestStatus(req.params.id, req.body.status);
    res.status(200).json({ ok: true });
});

// Удалить заявку
requestRouter.delete('/:id', authMiddleware, async (req, res) => {
    await deleteRequest(req.params.id);
    res.status(200).json({ ok: true });
});

module.exports = requestRouter;