const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { cacheMiddleware, saveToCache, clearUsersCache } = require('../middleware/cache');

const SERVER_ID = process.env.SERVER_ID || 'unknown';

router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    const user = await User.create({ first_name, last_name, age });
    await clearUsersCache();
    res.status(201).json({ source: 'server', server: SERVER_ID, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/',
  cacheMiddleware(() => 'users:all', 60),
  async (req, res) => {
    try {
      const users = await User.findAll();
      await saveToCache(req.cacheKey, users, req.cacheTTL);
      res.json({ source: 'server', server: SERVER_ID, data: users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get('/:id',
  cacheMiddleware((req) => `users:${req.params.id}`, 60),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
      await saveToCache(req.cacheKey, user, req.cacheTTL);
      res.json({ source: 'server', server: SERVER_ID, data: user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.update({ ...req.body, updated_at: new Date() });
    await clearUsersCache(req.params.id);
    res.json({ source: 'server', server: SERVER_ID, data: user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    await user.destroy();
    await clearUsersCache(req.params.id);
    res.json({ message: 'Пользователь удалён', server: SERVER_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;