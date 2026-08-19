# Clinic Appointment Booking System

A full-stack web application that lets **patients** book appointments with **doctors**, lets **doctors** manage their schedule, and gives **admins** an overview of the whole clinic. Built as the WithUnion Junior Full Stack Developer technical assessment.

---

## 1. Problem Statement

Small clinics often rely on phone calls or paper logs to schedule appointments, which leads to double-bookings, lost notes, and poor visibility for patients and staff. This app provides a single place to:

- Patients: browse doctors, book an appointment for a future time slot, and track/cancel their own bookings.
- Doctors: see only their appointments and move them through a status workflow (pending → confirmed → completed / cancelled).
- Admins: see clinic-wide stats, the doctor directory, and remove any appointment.

## 2. Target Users

- **Patients** — anyone who needs to see a doctor.
- **Doctors** — clinic staff who provide consultations.
- **Admins** — clinic managers who oversee operations.

## 3. Main Features

- Secure registration & login (JWT, bcrypt-hashed passwords).
- Role-based access: patient / doctor / admin.
- CRUD on appointments (create, read, update status, delete).
- Doctors directory with specialties.
- Conflict prevention: a doctor cannot be double-booked at the same time slot.
- Responsive UI with loading, error, and empty states.
- Server-side input validation and a centralized error handler.

## 4. Technology Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend   | Node.js, Express.js |
| Database  | MySQL 8 via **Prisma ORM** (`@prisma/client`) |
| Auth      | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Validation| `express-validator` |

## 5. Architecture Overview

The project is split into two independently deployable apps that talk over HTTP:

```
clinic-booking/
├── client/          # Next.js frontend (port 3000)
│   └── src/
│       ├── app/         # Pages (login, register, dashboard, book, appointments, admin)
│       ├── components/  # Reusable UI (Navbar, ProtectedRoute, AppointmentList, Feedback)
│       ├── context/     # AuthContext (token + current user)
│       └── lib/         # API client (fetch wrapper + token storage)
├── server/          # Express API (port 4000)
│   └── src/
│       ├── config/      # env loader, mysql pool
│       ├── routes/      # express routers (auth, doctors, appointments)
│       ├── controllers/ # HTTP layer (request/response, authz checks)
│       ├── services/    # data access (parameterized SQL)
│       ├── middleware/  # authenticate, authorize, validate, errorHandler
│       ├── validators/  # express-validator chains
│       ├── utils/       # jwt, response helpers, asyncHandler
│       └── seed.js      # demo data
├── database/
│   ├── schema.sql    # tables
│   └── seed.sql      # optional appointment seed
└── README.md
```

**Key design decisions**

- **Layered backend**: routes → controllers → services. Controllers handle HTTP/permissions; services own all **Prisma** data access. This keeps logic testable and reusable.
- **Single source of truth for auth**: `authenticate` validates the JWT and sets `req.user`; `authorize(...roles)` enforces role; ownership is checked inside controllers (e.g. a patient can only cancel *their* appointment).
- **Parameterized queries everywhere** — Prisma generates safe, parameterized SQL from the `schema.prisma` model, eliminating SQL injection by design.
- **Frontend talks only to the API** — no mock data. `AuthContext` stores the JWT in `localStorage` and the API client attaches it as a Bearer token.
- **Protected routes** (`ProtectedRoute`) guard pages client-side and the API guards them server-side (defense in depth).

### Database Schema

- `users` (id, full_name, email unique, password_hash, role, phone)
- `doctors` (id, user_id → users, specialty, bio, is_active) — links a login account to a doctor profile
- `appointments` (id, patient_id → users, doctor_id → doctors, appointment_at, reason, status, notes)

Relationships: a patient (user) books an appointment with a doctor (profile); an appointment carries a `status` workflow.

## 6. Installation & Setup

### Prerequisites
- Node.js 18+
- MySQL 8 (e.g. [MySQL Community Server](https://dev.mysql.com/downloads/) or XAMPP)

### Database (Prisma)
```bash
cd server
cp .env.example .env        # set DATABASE_URL to your MySQL instance
npm install
npm run prisma:migrate     # creates migrations + applies them + generates Prisma Client
```

The schema lives in `server/prisma/schema.prisma` (models: `User`, `Doctor`, `Appointment`,
plus `Role` and `AppointmentStatus` enums). Prisma manages the MySQL schema — no raw `.sql`
files are used. (Dev shortcut: `npm run prisma:push` applies the schema without migrations.)

### Backend
```bash
cd server
cp .env.example .env        # set DATABASE_URL + JWT_SECRET
npm install
npm run seed                # creates demo users + doctors + 1 appointment
npm run dev                 # http://localhost:4000
```

### Frontend
```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

Open http://localhost:3000 and sign in with a seeded account:

| Email | Password | Role |
|-------|----------|------|
| admin@clinic.com | Password123 | admin |
| alice@clinic.com | Password123 | doctor |
| carol@clinic.com | Password123 | patient |

You can also register a new patient from the UI.

## 7. Environment Variables

**server/.env**
```
PORT=4000
# Prisma connection string (MySQL)
DATABASE_URL="mysql://root:your_mysql_password@127.0.0.1:3306/clinic_booking"
JWT_SECRET=long_random_string
JWT_EXPIRES_IN=7d
```

**client/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> `.env` / `.env.local` are git-ignored. Never commit secrets.

## 8. API Overview

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register (defaults to patient) |
| POST | `/auth/login` | — | Login → returns JWT + user |
| GET  | `/auth/me` | user | Current user profile |
| GET  | `/doctors` | user | List active doctors |
| POST | `/appointments` | patient | Book appointment |
| GET  | `/appointments` | user | List (scoped by role) |
| PATCH| `/appointments/:id/status` | doctor/admin | Update status |
| PATCH| `/appointments/:id/cancel` | patient/doctor | Cancel |
| DELETE| `/appointments/:id` | admin | Delete |

Example:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@clinic.com","password":"Password123"}'
```

## 9. Security

- Passwords hashed with `bcryptjs` (cost 10); plaintext is never stored.
- JWTs signed with a secret from env; sent as `Bearer` tokens.
- All DB queries use parameterized statements (no string concatenation → no SQL injection).
- Server-side validation with `express-validator`; clear 422 responses.
- Authorization: role checks (`authorize`) **and** ownership checks (a patient can only act on their own appointments; a doctor only on theirs).
- Secrets live in `.env` (git-ignored), never in code.

## 10. Known Limitations

- No email/SMS reminders or time-slot availability UI (patients pick a free datetime).
- Token stored in `localStorage` (simple for demo; httpOnly cookies would be stronger).
- No automated tests yet (manual testing via UI/curl).
- Single clinic, no multi-tenant support.

## 11. What I'd Improve With More Time

- Add refresh tokens + httpOnly cookie auth.
- Availability calendar so patients pick from open slots (prevents guessing).
- Automated tests (Jest + Supertest) for controllers/services.
- Pagination, filtering, and doctor CRUD for admins.
- Docker Compose for one-command MySQL + services.
- CI pipeline and deployment (Vercel + Render / Railway).

---

## Submission Notes

- **Most difficult part**: designing the appointment status workflow with correct role *and* ownership enforcement (patient vs doctor vs admin). I solved it by centralizing auth in middleware (`authenticate`, `authorize`) and performing explicit ownership checks in the controller using `req.user.id` against the appointment's `patient_id` / `doctor_id`.

Good luck, and thank you for reviewing!
