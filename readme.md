# Sahayogi Hub

Single setup guide for collaborators working on both the frontend and backend.

## Prerequisites

- Git
- Node.js (LTS recommended)
- npm (ships with Node.js)
- PHP 8.2+
- Composer
- A local database (PostgreSQL)

## Repo Structure

- `frontend/` - Next.js app
- `api-backend/` - Laravel API

## Initial Setup

### 1) Clone the repo

```bash
git clone <your-repo-url>
cd Sahayogi-hub
```

### 2) Backend (Laravel)

```bash
cd api-backend
composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then run:

```bash
php artisan migrate
```

Start the API server:

```bash
php artisan serve
```

### 3) Frontend (Next.js)

```bash
cd ../frontend
npm install
```

Start the frontend dev server:

```bash
npm run dev
```

## Daily Workflow

1. Pull latest changes:

```bash
git pull
```

2. Create a new branch for your task:

```bash
git checkout -b feature/<short-task-name>
```

3. Commit and push your changes:

```bash
git add .
git commit -m "<clear message>"
git push -u origin feature/<short-task-name>
```

Use a clear commit message and a brief PR description that summarizes what you changed.

4. Open a Pull Request.

## Weekly Branch Policy

- For every task each week, create a new branch.
- After everything from the previous week is merged, delete the old branch.

## Notes

- If you change backend env values, inform the team.
