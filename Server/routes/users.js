const express = require('express');
const bcrypt = require('bcrypt');
const userRouter = express.Router();
const { getUserByEmail, addUser, getUserById, updateUser } = require('../db/users');
const { getRoleByName } = require('../db/roles');
const { addProfile } = require('../db/profiles');
const authMiddleware = require('../middleware/auth');


//reqistry
userRouter.post('/', async (req, res) => {
    const existing = await getUserByEmail(req.body.email);

    if (existing) {
        return res.status(400).json({
            message: 'Такой пользователь уже есть'
        });
    }

    const role = await getRoleByName(req.body.role || 'customer');

    if (!role) {
        return res.status(400).json({
            message: 'Неверная роль'
        });
    }

    const password_hash = await bcrypt.hash(req.body.password, 10);

    const newUser = await addUser(
        req.body.email,
        password_hash,
        role.id,
        req.body.name
    );

    res.status(200).json(newUser);
});

//current user
userRouter.get('/me', authMiddleware, async (req, res) => {
    const user = await getUserById(req.userId);

    if (!user) {
        return res.status(404).json({
            message: 'Пользователь не найден'
        });
    }

    res.status(200).json(user);
});

// Обновление данных пользователя
userRouter.put('/:id', authMiddleware, async (req, res) => {
    try {
        await updateUser(req.params.id, { name: req.body.name, email: req.body.email });
        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(500).json({ message: 'Ошибка обновления' });
    }
});

module.exports = userRouter;