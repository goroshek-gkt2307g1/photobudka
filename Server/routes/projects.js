const express = require('express');
const bcrypt = require('bcrypt');
const projectRouter = express.Router();
const {
    addProject,
    getProjectById,
    getAllProjectsByProfile,
    getProjectsByProfile,
    getPublicProjects,
    updateProject,
    deleteProject
} = require('../db/projects');
const authMiddleware = require('../middleware/auth');

// Публичные проекты
projectRouter.get('/', async (req, res) => {
    const projects = await getPublicProjects();
    res.status(200).json(projects);
});

// Все проекты профиля (для владельца)
projectRouter.get('/profile/:profileId/all', async (req, res) => {
    const projects = await getAllProjectsByProfile(req.params.profileId);
    res.status(200).json(projects);
});

// Проекты фотографа
projectRouter.get('/profile/:profileId', async (req, res) => {
    const projects = await getProjectsByProfile(req.params.profileId);
    res.status(200).json(projects);
});

// Проект по ID
projectRouter.get('/:id', async (req, res) => {
    const project = await getProjectById(req.params.id);

    if (!project) {
        return res.status(404).json({
            message: 'Проект не найден'
        });
    }

    res.status(200).json(project);
});

// Создать проект
projectRouter.post('/', authMiddleware, async (req, res) => {
    let access_password = null;

    if (req.body.is_private && req.body.access_password) {
        access_password = await bcrypt.hash(req.body.access_password, 10);
    }

    const project = await addProject(
        req.body.profile_id,
        req.body.title,
        req.body.description,
        req.body.genre,
        req.body.shoot_date,
        req.body.is_private,
        access_password,
        req.body.cover_photo_url
    );

    res.status(200).json(project);
});

// Обновить проект
projectRouter.put('/:id', authMiddleware, async (req, res) => {
    await updateProject(req.params.id, req.body);
    res.status(200).json({ ok: true });
});

// Удалить проект
projectRouter.delete('/:id', authMiddleware, async (req, res) => {
    await deleteProject(req.params.id);
    res.status(200).json({ ok: true });
});

// Доступ к приватному проекту по паролю
projectRouter.post('/:id/access', async (req, res) => {
    const project = await getProjectById(req.params.id);

    if (!project) {
        return res.status(404).json({
            message: 'Проект не найден'
        });
    }

    if (!project.is_private) {
        return res.status(200).json({ ok: true });
    }

    const isValid = await bcrypt.compare(
        req.body.password,
        project.access_password
    );

    if (!isValid) {
        return res.status(403).json({
            message: 'Неверный пароль'
        });
    }

    res.status(200).json({ ok: true });
});

module.exports = projectRouter;