//тут происходит проверка токена
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'lolkek'
const COOKIE_NAME = 'token'

const authMiddleware = (req, res, next) => {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            message: 'Пользователь не авторизован'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Недействительный токен'
        });
    }
};

module.exports = authMiddleware;