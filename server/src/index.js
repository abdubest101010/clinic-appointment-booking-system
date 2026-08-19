const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { prisma } = require('./config/prisma');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'API is running.' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 + central error handler (registered last)
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await prisma.$connect();
    console.log('[db] Connected to MySQL via Prisma.');
    app.listen(config.port, () => {
      console.log(`[server] Clinic Booking API listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
