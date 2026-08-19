require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // DATABASE_URL is provided by Prisma (see .env and prisma/schema.prisma)
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
