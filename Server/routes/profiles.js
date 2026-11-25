const express = require('express');
const profileRouter = express.Router();
const {
    addProfile, getProfileByID,
    getProfileByUserId, updateProfile,
    deleteProfile, searchProfiles, getProfiles
} = require('../db/profiles');
const authMiddleware = require('../middleware/auth')

//list profile
profileRouter.get('/', async (req, res) => {
    const { city, genre, maxPrice } = req.query;
    const profiles = await searchProfiles(city, genre, maxPrice);
    res.status(200).json(profiles);
});

//profile by id
profileRouter.get('/:id', async (req, res) => {
    const profile = await getProfileById(req.params.id);

    if (!profile) {
        return res.status(404).json({
            message: 'Профиль не найден'
        });
    }

    res.status(200).json(profile);
});

//create profile
profileRouter.post('/', authMiddleware, async (req, res) => {
    const existing = await getProfileByUserId(req.userId);

    if (existing) {
        return res.status(400).json({
            message: 'Профиль уже существует'
        });
    }

    const profile = await addProfile(
        req.userId,
        req.body.city,
        req.body.genres,
        req.body.price_hour,
        req.body.description,
        req.body.avatar_url
    );

    res.status(200).json(profile);
});

//upd profile
profileRouter.put('/:id', authMiddleware, async (req, res) => {
    await updateProfile(req.params.id, req.body);
    res.status(200).json({ ok: true });
});

//delete profile
profileRouter.delete('/:id', authMiddleware, async (req, res) => {
    await deleteProfile(req.params.id);
    res.status(200).json({ ok: true });
});

module.exports = profileRouter;