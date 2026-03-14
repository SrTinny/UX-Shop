# Backend - UX Shop (API)

API em Node.js + TypeScript com Express e Prisma/PostgreSQL.

## Stack
- Node.js, TypeScript, Express, Prisma
- Zod para validação

## Segurança de autenticação
- Access token em cookie HttpOnly de curta duração.
- Refresh token rotativo em cookie HttpOnly.
- Proteção CSRF por double-submit token (`X-CSRF-Token`).
- Sessão atual via `GET /auth/me`.

## Endpoints de auth (resumo)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/activate/:token`

## Endereços de cliente
- `POST /auth/addresses`
- `PUT /auth/addresses/:id`
- `POST /auth/addresses/:id/select`
- `DELETE /auth/addresses/:id`

O usuário mantém `selectedAddressId`, usado pelo frontend para mostrar o endereço escolhido no header.

## Prisma (resumo)
- `User` com `selectedAddressId`.
- `Address` vinculada ao `User`.
- Migrations em `prisma/migrations`.

## Como rodar
```powershell
cd backend
npm install
npm run dev
```

Build:

```powershell
npm run build
```

Migrations + seed (dev):

```powershell
npx prisma migrate dev --name <nome>
npx prisma generate
npx prisma db seed
```

## Variáveis de ambiente relevantes
- `DATABASE_URL` (obrigatória)
- `JWT_SECRET` (obrigatória)
- `PORT` (default `3000`)
- `FRONTEND_URL`
- `JWT_ACCESS_TOKEN_MINUTES` (default `15`)
- `JWT_REFRESH_TOKEN_DAYS` (default `30`)
- `AUTH_ACTIVATION_TOKEN_HOURS` (default `24`)
- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAME_SITE`
- `AUTH_COOKIE_DOMAIN`

## Seed
- Admin criado por padrão: `admin@ux.com` / `admin123`

