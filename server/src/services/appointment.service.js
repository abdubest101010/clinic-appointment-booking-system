const { pool } = require('../config/db');

// Appointment service: all reads/writes for the appointments table.

async function findDoctorByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT id FROM doctors WHERE user_id = ? AND is_active = TRUE',
    [userId]
  );
  return rows[0] || null;
}

// Check for a conflicting appointment for the same doctor at the same time slot.
async function hasConflict(doctorId, appointmentAt, excludeId = null) {
  let sql =
    'SELECT id FROM appointments WHERE doctor_id = ? AND appointment_at = ? AND status != ?';
  const params = [doctorId, appointmentAt, 'cancelled'];
  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
}

async function createAppointment({ patientId, doctorId, appointmentAt, reason }) {
  const [result] = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_at, reason)
     VALUES (?, ?, ?, ?)`,
    [patientId, doctorId, appointmentAt, reason]
  );
  return getAppointmentById(result.insertId);
}

async function getAppointmentById(id) {
  const [rows] = await pool.query(
    `SELECT a.id, a.appointment_at, a.reason, a.status, a.notes, a.created_at,
            p.id AS patient_id, p.full_name AS patient_name,
            d.id AS doctor_id, du.full_name AS doctor_name, d.specialty
     FROM appointments a
     JOIN users p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listAppointmentsForPatient(patientId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.appointment_at, a.reason, a.status, a.notes, a.created_at,
            d.id AS doctor_id, du.full_name AS doctor_name, d.specialty
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_at DESC`,
    [patientId]
  );
  return rows;
}

async function listAppointmentsForDoctor(doctorId) {
  const [rows] = await pool.query(
    `SELECT a.id, a.appointment_at, a.reason, a.status, a.notes, a.created_at,
            p.id AS patient_id, p.full_name AS patient_name
     FROM appointments a
     JOIN users p ON p.id = a.patient_id
     WHERE a.doctor_id = ?
     ORDER BY a.appointment_at DESC`,
    [doctorId]
  );
  return rows;
}

async function listAllAppointments() {
  const [rows] = await pool.query(
    `SELECT a.id, a.appointment_at, a.reason, a.status, a.created_at,
            p.full_name AS patient_name, du.full_name AS doctor_name, d.specialty
     FROM appointments a
     JOIN users p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     ORDER BY a.appointment_at DESC`
  );
  return rows;
}

async function updateStatus(id, status, notes = null) {
  await pool.query(
    'UPDATE appointments SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
    [status, notes, id]
  );
  return getAppointmentById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
}

module.exports = {
  findDoctorByUserId,
  hasConflict,
  createAppointment,
  getAppointmentById,
  listAppointmentsForPatient,
  listAppointmentsForDoctor,
  listAllAppointments,
  updateStatus,
  remove,
};
