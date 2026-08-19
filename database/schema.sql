-- Clinic Appointment Booking System
-- Database schema for MySQL 8.x
-- Run with: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS clinic_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE clinic_booking;

-- ---------------------------------------------------------------------------
-- USERS
-- Stores every account. `role` decides what the user can do.
-- Roles: patient | doctor | admin
-- Passwords are NEVER stored in plaintext; only bcrypt hashes live here.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('patient','doctor','admin') NOT NULL DEFAULT 'patient',
  phone         VARCHAR(30)  NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- DOCTORS
-- One row per doctor. `user_id` links to the user account they log in with.
-- A doctor can be a user too (so they can log in), but not every user is a doctor.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  specialty    VARCHAR(120) NOT NULL,
  bio          TEXT         NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_user (user_id),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- APPOINTMENTS
-- The core entity. Links a patient (user) to a doctor (user) at a date/time.
-- status flow: pending -> confirmed -> completed | cancelled
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id    INT UNSIGNED NOT NULL,
  doctor_id     INT UNSIGNED NOT NULL,
  appointment_at DATETIME    NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  status        ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  notes         TEXT         NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors (id) ON DELETE CASCADE,
  INDEX idx_appointments_doctor (doctor_id),
  INDEX idx_appointments_patient (patient_id),
  INDEX idx_appointments_status (status)
) ENGINE=InnoDB;
