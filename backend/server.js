const express = require('express');
const { connectDB } = require('./config/database');
const { initRedis } = require('./middleware/cache');
const usersRouter = require('./routes/users');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SERVER_ID = process.env.SERVER_ID || 'unknown';

app.get('/', (req, res) => {
  res.json({ message: 'Response from backend', server: SERVER_ID });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: SERVER_ID });
});

app.use('/api/users', usersRouter);

async function start() {
  await connectDB();
  await initRedis();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[${SERVER_ID}] Сервер запущен на порту ${PORT}`);
  });
}

start().catch(err => console.error(`[${SERVER_ID}] Ошибка:`, err));