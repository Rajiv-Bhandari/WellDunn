# WellDunn

A lightweight project management system. Track work across **To Do → Working On → Completed → Cancelled** with per-user isolation.

**Stack**

- **Next.js 15** (App Router, Server Actions, React 19)
- **Neon Postgres** (serverless driver via `@neondatabase/serverless`)
- **Drizzle ORM** + Drizzle Kit
- **Auth.js v5** (Credentials provider, JWT sessions)
- **Tailwind CSS** + **shadcn/ui** components

---

## Local development

### 1. Install

```bash
cd WellDunn
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

You need:

| Variable        | Where it comes from                                                       |
| --------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`  | Neon dashboard → your project → **Connection string** (use the **pooled** one for serverless) |
| `AUTH_SECRET`   | Generate with `openssl rand -base64 32`                                   |

### 3. Push the schema to Neon

```bash
npm run db:push
```

This creates the `users` and `projects` tables plus the `project_status` enum directly. (For production, use `db:generate` + `db:migrate` instead.)

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000`, register an account, and start adding projects.

---

## Deploying to Vercel

### Step 1 — push to GitHub

```bash
git init
git add .
git commit -m "Initial WellDunn commit"
git remote add origin <your-repo>
git push -u origin main
```

### Step 2 — import the repo on Vercel

In the Vercel dashboard: **Add New → Project → Import** your repo. Framework preset will auto-detect as **Next.js**.

### Step 3 — paste these environment variables into Vercel

Go to **Project Settings → Environment Variables** and add:

| Name           | Value                                                          | Notes                                                           |
| -------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://<user>:<pass>@<host>/<db>?sslmode=require` | Use the **pooled** Neon URL. Apply to **Production + Preview + Development**. |
| `AUTH_SECRET`  | A random 32-byte base64 string (run `openssl rand -base64 32`) | Required by Auth.js v5. Apply to **all environments**.          |

> **Tip:** Vercel automatically populates `VERCEL_URL` per-deployment, so Auth.js v5 resolves callback URLs correctly without you setting `AUTH_URL`. Only set `AUTH_URL` if you're on a custom domain *and* run into callback issues.

### Step 4 — push the schema once

After your first deploy, run the schema push from your local machine (pointing at the same Neon DB):

```bash
npm run db:push
```

### Step 5 — deploy

Hit **Deploy** in Vercel. The app will build and go live. Register an account on the deployed URL — you're done.

---

## Project structure

```
WellDunn/
├── auth.ts                    # Auth.js v5 config (Credentials + Drizzle lookup)
├── auth.config.ts             # Edge-safe config (used in middleware.ts)
├── middleware.ts              # Route protection
├── drizzle.config.ts          # Drizzle Kit config
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts   # NextAuth handlers
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx       # Lists projects for the logged-in user
│   │       └── actions.ts     # Server Actions (create/update/delete)
│   ├── actions/auth.ts        # Register + login Server Actions
│   ├── components/
│   │   ├── KanbanBoard.tsx
│   │   ├── NewProjectDialog.tsx
│   │   ├── LoginForm.tsx, RegisterForm.tsx, SignOutButton.tsx
│   │   └── ui/                # shadcn primitives (button, card, input, ...)
│   ├── db/
│   │   ├── schema.ts          # users + projects + project_status enum
│   │   └── index.ts           # Drizzle client (Neon HTTP driver)
│   ├── lib/utils.ts
│   └── types/next-auth.d.ts   # Augments Session.user with `id`
```

## Schema

```ts
users: id (uuid pk), name, email (unique), password_hash, created_at
projects: id (uuid pk), user_id (fk → users.id, cascade), title,
          description, status (enum: todo|in_progress|completed|cancelled),
          created_at, updated_at
```

## Security notes

- Passwords are hashed with **bcryptjs** (cost factor 10).
- Sessions are **JWT** (no DB session lookup) — works on Vercel Edge.
- Every Server Action re-checks the session and scopes queries by `userId` so users can never read or mutate another account's projects.
- The middleware redirects unauthenticated users away from `/dashboard` and authenticated users away from `/login` and `/register`.
