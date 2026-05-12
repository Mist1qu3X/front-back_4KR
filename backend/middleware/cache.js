const redis = require('redis');

let redisClient = null;

async function initRedis() {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => {
    console.log(`[${process.env.SERVER_ID}] Redis ошибка:`, err.message);
    redisClient = null;
  });

  try {
    await redisClient.connect();
    console.log(`[${process.env.SERVER_ID}] Redis подключен`);
  } catch (err) {
    console.log(`[${process.env.SERVER_ID}] Redis недоступен`);
    redisClient = null;
  }
}

function cacheMiddleware(keyBuilder, ttl) {
  return async (req, res, next) => {
    if (!redisClient) return next();

    try {
      const key = keyBuilder(req);
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json({ source: 'cache', data: JSON.parse(cachedData) });
      }
      req.cacheKey = key;
      req.cacheTTL = ttl;
      next();
    } catch (err) {
      next();
    }
  };
}

async function saveToCache(key, data, ttl) {
  if (!redisClient || !key) return;
  try {
    await redisClient.set(key, JSON.stringify(data), { EX: ttl });
  } catch (err) {}
}

async function clearUsersCache(userId = null) {
  if (!redisClient) return;
  try {
    await redisClient.del('users:all');
    if (userId) await redisClient.del(`users:${userId}`);
  } catch (err) {}
}

module.exports = { initRedis, cacheMiddleware, saveToCache, clearUsersCache };