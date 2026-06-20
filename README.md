# Futsal Booking Admin

Production-ready internal futsal booking management app built with Next.js App Router, TypeScript, NextAuth Credentials auth, server-side RBAC, Prisma, and PostgreSQL.

This final GitHub/deployment version is configured for **PostgreSQL**, not SQLite.

## Included features

- Super Admin and Booking Admin roles
- Username/password internal login
- Server-side route/action permissions
- Admin creation, deactivate/reactivate, reset password, delete
- Bookings, cancellation, deletion, mark-paid flow, and conflict prevention
- Schedule day/week views with booking drawer
- Existing customer auto-fill while booking
- Customers, courts, pricing, reports, settings, and audit log
- Mobile/tablet/desktop responsive layout
- Fixed mobile navigation drawer background/overlay
- Prisma seed with bcrypt-hashed users
- PostgreSQL-ready Prisma schema

## Required environment variables

Create `.env` locally, or add these variables in Railway/Render:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
NEXTAUTH_URL=https://your-production-domain.com
APP_URL=https://your-production-domain.com
NEXTAUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
SEED_SUPER_ADMIN_NAME=Owner
SEED_SUPER_ADMIN_USERNAME=owner
SEED_SUPER_ADMIN_PASSWORD=ChangeMe123!
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false
NEXT_ALLOWED_DEV_ORIGINS=
```

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Local setup with PostgreSQL

You need a PostgreSQL database running locally or hosted online.

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Seed login:

```txt
Super Admin: owner / ChangeMe123!
Booking Admin: staff / StaffPass123!
```

Change the seed password before real use.

## Railway deployment

This repo includes `railway.json`.

Recommended Railway variables:

```env
DATABASE_URL=<Railway PostgreSQL DATABASE_URL>
NEXTAUTH_URL=https://your-app.up.railway.app
APP_URL=https://your-app.up.railway.app
NEXTAUTH_SECRET=<strong random secret>
SEED_SUPER_ADMIN_NAME=Owner
SEED_SUPER_ADMIN_USERNAME=owner
SEED_SUPER_ADMIN_PASSWORD=<strong temporary password>
NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false
NODE_ENV=production
```

Railway build/start commands are defined in `railway.json`:

```txt
Build: npm install && npx prisma generate && npx prisma db push && npm run build
Start: npm run start
```

After first deployment, seed once if needed:

```bash
npx prisma db seed
```

## GitHub push steps

```bash
git init
git add .
git commit -m "Initial futsal booking app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If GitHub already has a README and rejects your push:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

If you want to overwrite the remote repo completely:

```bash
git push -u origin main --force
```

## Important production notes

- Do not commit `.env`.
- Keep the GitHub repo private for internal business use.
- Use HTTPS in production.
- Use a managed PostgreSQL database with backups.
- Set `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=false`.
- Replace the seed Super Admin password immediately.
- Do not run `db:reset` on production data.

## Useful commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to PostgreSQL
npm run db:seed       # Seed default users/data
npm run db:setup      # Generate client, push schema, and seed
npm run dev           # Run local dev server
npm run build         # Production build
npm run start         # Start production server
```

## Prisma schema

The production datasource is already set to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
