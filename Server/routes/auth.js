const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authRouter = express.Router();
const { getUserByEmail } = require('../db/users');

const JWT_SECRET = process.env.JWT_SECRET || 'lolkek';
const COOKIE_NAME = 'token';

authRouter.post('/', async (req, res) => {
    const user = await getUserByEmail(req.body.email);

    if (!user) {
        return res.status(404).json({
            message: 'Такой пользователь не найден'
        });
    }

    const isValid = await bcrypt.compare(req.body.password, user.password_hash);

    if (!isValid) {
        return res.status(400).json({
            message: 'Пароль неверный'
        });
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role_id_FK },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.cookie(COOKIE_NAME, token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ ok: true });
});

authRouter.delete('/', async (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.status(200).json({ ok: true });
});

module.exports = authRouter;