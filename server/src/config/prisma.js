// Prisma client singleton (avoids multiple instances in dev hot-reload).
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = { prisma };
