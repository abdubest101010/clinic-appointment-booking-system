# Database

This project uses **Prisma** as the ORM over **MySQL**.

- The schema lives in [`../server/prisma/schema.prisma`](../server/prisma/schema.prisma).
- Migrations are generated under `server/prisma/migrations/`.
- The database is created/migrated from the schema, not from raw `.sql` files.

## Setup

```bash
cd server
cp .env.example .env          # set DATABASE_URL to your MySQL instance
npm install
npm run prisma:migrate       # creates migrations + applies them + generates client
npm run seed                  # demo users, doctors, one appointment
```

If you prefer a quick non-migrated push (dev only): `npm run prisma:push`.
