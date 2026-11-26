# CareWeaPredictions v2

Motor de predicción de fútbol (Poisson / Dixon-Coles + contexto multi-fuente) con un frontend
rehecho desde cero: animado, oscuro por defecto e instalable en **Windows y Android**.

> Proyecto educativo y de portfolio. El juego puede ser adictivo. +18.

- **Plan maestro (fases):** [`docs/PLAN.md`](docs/PLAN.md)
- **Backend y base de datos:** [`docs/backend/FEATURES.md`](docs/backend/FEATURES.md) · [`docs/backend/NEON.md`](docs/backend/NEON.md)

## Stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Motion · Neon PostgreSQL · Prisma ·
Vercel · PWA (Tauri 2 en fase 8)

## Puesta en marcha
```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL, DIRECT_URL, FOOTBALL_API_KEY, CRON_SECRET
npm run dev
```

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + build de producción |
| `npm run lint` | ESLint |
| `npm run verify` | Verificaciones offline del motor (`scripts/verify-*.ts`) |
| `npm run test:e2e` | Playwright en escritorio (Edge) y Android (Pixel 7) |
| `npm run db:migrate` / `db:migrate:http` | Migraciones Neon (TCP 5432 / HTTPS) |
