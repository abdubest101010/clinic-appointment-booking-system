// Seed script: creates demo users (real bcrypt hashes), doctor profiles, and
// a sample appointment using Prisma. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('./config/prisma');

const users = [
  { full_name: 'Clinic Admin',   email: 'admin@clinic.com',  password: 'Password123', role: 'admin',   phone: '+10000000001' },
  { full_name: 'Dr. Alice Reed', email: 'alice@clinic.com',  password: 'Password123', role: 'doctor',  phone: '+10000000002' },
  { full_name: 'Dr. Bob Stone',  email: 'bob@clinic.com',    password: 'Password123', role: 'doctor',  phone: '+10000000003' },
  { full_name: 'Carol Patient',  email: 'carol@clinic.com',  password: 'Password123', role: 'patient', phone: '+10000000004' },
  { full_name: 'Dave Patient',   email: 'dave@clinic.com',   password: 'Password123', role: 'patient', phone: '+10000000005' },
];

const doctorProfiles = {
  'alice@clinic.com': { specialty: 'Cardiology',  bio: 'Experienced heart specialist.' },
  'bob@clinic.com':   { specialty: 'Dermatology', bio: 'Skin and hair care expert.' },
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function seed() {
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`skip user ${u.email} (exists)`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    const created = await prisma.user.create({
      data: { fullName: u.full_name, email: u.email, passwordHash, role: u.role, phone: u.phone },
    });

    if (u.role === 'doctor' && doctorProfiles[u.email]) {
      const p = doctorProfiles[u.email];
      await prisma.doctor.create({
        data: { userId: created.id, specialty: p.specialty, bio: p.bio, isActive: true },
      });
    }
    console.log(`created user ${u.email}`);
  }

  const carol = await prisma.user.findUnique({ where: { email: 'carol@clinic.com' } });
  const aliceDoc = await prisma.doctor.findFirst({ where: { user: { email: 'alice@clinic.com' } } });
  const count = await prisma.appointment.count();

  if (carol && aliceDoc && count === 0) {
    await prisma.appointment.create({
      data: {
        patientId: carol.id,
        doctorId: aliceDoc.id,
        appointmentAt: addDays(new Date(), 2),
        reason: 'Routine heart check-up',
        status: 'pending',
      },
    });
    console.log('created sample appointment');
  }

  console.log('\nSeed complete. Demo login -> admin@clinic.com / Password123');
  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
