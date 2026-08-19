const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');

// All data access goes through Prisma. Outputs are mapped to snake_case DTOs
// so the API contract (and the frontend) stays stable regardless of the DB.

async function findByEmail(email) {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return null;
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    password_hash: u.passwordHash,
    role: u.role,
    phone: u.phone,
  };
}

async function findById(id) {
  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, role: true, phone: true, createdAt: true },
  });
  if (!u) return null;
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    role: u.role,
    phone: u.phone,
    created_at: u.createdAt,
  };
}

async function createUser({ full_name, email, password, role = 'patient', phone = null }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const u = await prisma.user.create({
    data: { fullName: full_name, email, passwordHash, role, phone },
    select: { id: true, fullName: true, email: true, role: true, phone: true },
  });
  return {
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    role: u.role,
    phone: u.phone,
  };
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { findByEmail, findById, createUser, verifyPassword };
