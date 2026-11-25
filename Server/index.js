require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDb } = require('./db/db');

const app = express();
const port = process.env.PORT || 3001;

//CORS — ПЕРВЫМ
app.use(cors({
    credentials: true,
    origin: true
}));

//Парсеры
app.use(express.json());
app.use(cookieParser());

app.use('/storage', express.static(path.join(__dirname, 'storage')));

//Роуты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/requests', require('./routes/requests'));

//404 — если роут не найден
app.use((req, res) => {
    res.status(404).json({ message: 'Эндпоинт не найден' });
});

//500 — глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ошибка сервера' });
});

//Запуск сервера
(async () => {
    await initDb();
    app.listen(port, () => {
        console.log(`Сервер запущен на порту ${port}`);
    });
})();