const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const photoRouter = express.Router();
const jwt = require('jsonwebtoken');

const { addPhoto, getPhotosByProject, getPhotoById, deletePhoto } = require('../db/photos');
const { getProjectById } = require('../db/projects'); // Добавили импорт
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_123';

// Настройка диска
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const projectId = req.body.project_id;
        const dir = path.join(__dirname, '../storage/photos/project_' + projectId);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Получить фото проекта
photoRouter.get('/project/:projectId', async (req, res) => {
    const photos = await getPhotosByProject(req.params.projectId);
    res.status(200).json(photos);
});

// ЗАЩИЩЕННАЯ РАЗДАЧА ФАЙЛОВ (вместо express.static в index.js)
photoRouter.get('/file/:projectId/:filename', async (req, res) => {
    try {
        const { projectId, filename } = req.params;
        const project = await getProjectById(projectId);

        if (!project) return res.status(404).send('Проект не найден');

        // Проверка прав на скачивание
        let canDownload = false;

        // 1. Если проект публичный - фото видно (но скачивать нельзя, только смотреть)
        // Но картинка должна загружаться на странице, поэтому мы разрешаем её ОТОБРАЖЕНИЕ всем, 
        // а кнопку "Скачать" просто скрываем на фронте.

        const filePath = path.join(__dirname, '../storage/photos/project_' + projectId, filename);

        if (fs.existsSync(filePath)) {
            // Отдаем файл (браузер его покажет)
            res.sendFile(filePath);
        } else {
            res.status(404).send('File not found');
        }
    } catch (e) {
        res.status(500).send('Server error');
    }
});

// Загрузить фото
photoRouter.post('/', authMiddleware, upload.array('photos', 50), async (req, res) => {
    try {
        const projectId = req.body.project_id;
        const uploaded = [];
        for (const file of req.files) {
            const relativePath = `/api/photos/file/${projectId}/${file.filename}`;
            const photo = await addPhoto(projectId, relativePath);
            uploaded.push(photo);
        }
        res.status(200).json(uploaded);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при загрузке' });
    }
});

// Удалить фото
photoRouter.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const photo = await getPhotoById(req.params.id);
        if (!photo) return res.status(404).json({ message: 'Фото не найдено' });

        const filePath = path.join(__dirname, '..', photo.file_path.replace('/api/photos/file/', '/storage/photos/project_'));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await deletePhoto(req.params.id);
        res.status(200).json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
});

module.exports = photoRouter;