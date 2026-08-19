const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// All DB access lives in services so controllers stay thin and reusable.

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, phone, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ full_name, email, password, role = 'patient', phone = null }) {
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, password_hash, role, phone]
  );
  return { id: result.insertId, full_name, email, role, phone };
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { findByEmail, findById, createUser, verifyPassword };
