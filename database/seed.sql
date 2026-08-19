-- Optional SQL seed for appointments.
-- NOTE: Create users/doctors via `npm run seed` in /server (real bcrypt hashes).
-- This file only adds sample appointments if the referenced data already exists.

USE clinic_booking;

INSERT INTO appointments (patient_id, doctor_id, appointment_at, reason, status)
SELECT
  (SELECT id FROM users WHERE email = 'carol@clinic.com'),
  (SELECT id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'alice@clinic.com'),
  DATE_ADD(NOW(), INTERVAL 2 DAY),
  'Routine heart check-up',
  'pending'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM appointments)
  AND EXISTS (SELECT 1 FROM users WHERE email = 'carol@clinic.com');
