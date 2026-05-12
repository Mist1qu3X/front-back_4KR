const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'mydatabase',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'password',
  {
    host: process.env.PG_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.PG_PORT || 5432
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`[${process.env.SERVER_ID}] PostgreSQL подключен`);
    await sequelize.sync({ alter: true });
    console.log(`[${process.env.SERVER_ID}] Таблицы синхронизированы`);
  } catch (err) {
    console.error(`[${process.env.SERVER_ID}] Ошибка PostgreSQL:`, err.message);
  }
}

module.exports = { sequelize, connectDB };