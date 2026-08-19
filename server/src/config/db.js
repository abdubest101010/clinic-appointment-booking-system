const mysql = require('mysql2/promise');
const config = require('./env');

// Connection pool: reuses connections, handles concurrency, auto-reconnects.
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// Test the connection once at startup so failures are obvious early.
async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log('[db] MySQL connection pool is ready.');
}

module.exports = { pool, testConnection };
