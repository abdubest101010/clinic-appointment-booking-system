const { pool } = require('../config/db');

// Doctors are users with role 'doctor' joined to the doctors profile table.

async function listActiveDoctors() {
  const [rows] = await pool.query(
    `SELECT d.id AS doctor_id, d.specialty, d.bio, d.is_active,
            u.id AS user_id, u.full_name, u.email
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     WHERE d.is_active = TRUE
     ORDER BY u.full_name ASC`
  );
  return rows;
}

async function findDoctorById(doctorId) {
  const [rows] = await pool.query('SELECT id FROM doctors WHERE id = ? AND is_active = TRUE', [doctorId]);
  return rows[0] || null;
}

module.exports = { listActiveDoctors, findDoctorById };
