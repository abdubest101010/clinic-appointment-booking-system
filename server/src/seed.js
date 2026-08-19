// Seed script: creates demo users (with real bcrypt hashes), doctor profiles,
// and sample appointments. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

const users = [
  { full_name: 'Clinic Admin',  email: 'admin@clinic.com',  password: 'Password123', role: 'admin',   phone: '+10000000001' },
  { full_name: 'Dr. Alice Reed', email: 'alice@clinic.com', password: 'Password123', role: 'doctor',  phone: '+10000000002' },
  { full_name: 'Dr. Bob Stone',  email: 'bob@clinic.com',   password: 'Password123', role: 'doctor',  phone: '+10000000003' },
  { full_name: 'Carol Patient',  email: 'carol@clinic.com', password: 'Password123', role: 'patient', phone: '+10000000004' },
  { full_name: 'Dave Patient',   email: 'dave@clinic.com',  password: 'Password123', role: 'patient', phone: '+10000000005' },
];

const doctorProfiles = {
  'alice@clinic.com': { specialty: 'Cardiology',  bio: 'Experienced heart specialist.' },
  'bob@clinic.com':   { specialty: 'Dermatology', bio: 'Skin and hair care expert.' },
};

async function seed() {
  for (const u of users) {
    const password_hash = await bcrypt.hash(u.password, 10);
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length) {
      console.log(`skip user ${u.email} (exists)`);
      continue;
    }
    const [res] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [u.full_name, u.email, password_hash, u.role, u.phone]
    );
    const userId = res.insertId;

    if (u.role === 'doctor' && doctorProfiles[u.email]) {
      const p = doctorProfiles[u.email];
      await pool.query(
        'INSERT INTO doctors (user_id, specialty, bio, is_active) VALUES (?, ?, ?, TRUE)',
        [userId, p.specialty, p.bio]
      );
    }
    console.log(`created user ${u.email}`);
  }

  // Sample appointment for Carol with Dr. Alice
  const [carol] = await pool.query("SELECT id FROM users WHERE email = 'carol@clinic.com'");
  const [aliceDoc] = await pool.query(
    "SELECT d.id FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.email = 'alice@clinic.com'"
  );
  if (carol.length && aliceDoc.length) {
    const [dup] = await pool.query('SELECT id FROM appointments');
    if (!dup.length) {
      await pool.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_at, reason, status) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 DAY), ?, ?)',
        [carol[0].id, aliceDoc[0].id, 'Routine heart check-up', 'pending']
      );
      console.log('created sample appointment');
    }
  }

  console.log('\nSeed complete. Demo login -> admin@clinic.com / Password123');
  await pool.end();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await pool.end();
  process.exit(1);
});
