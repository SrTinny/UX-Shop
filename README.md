# Projeto UX Software

Projeto Fullstack com loja online (autenticação, carrinho e área administrativa). Frontend em Next.js e backend em Express + Prisma.

Tecnologias principais
- Frontend: Next.js (App Router), React, TypeScript, TailwindCSS
- Backend: Express, TypeScript, Prisma, PostgreSQL
- Deploy: Vercel (frontend), Render (backend)

Estrutura do projeto

```markdown
/ (raiz)
├── frontend/   → Aplicação Next.js (cliente + admin)
├── backend/    → API Express (autenticação, produtos, carrinho)
└── README.md   → Este arquivo

````

Cada pasta contém seu próprio `README.md` com instruções mais detalhadas: `frontend/README.md` e `backend/README.md`.

Como rodar (resumo)

1. Backend

```powershell
cd "C:\Users\joaov\Documents\Projetos\UX Software\backend"
npm install
npm run dev
```

2. Frontend

```powershell
cd "C:\Users\joaov\Documents\Projetos\UX Software\frontend"
npm install
npm run dev
```

Variáveis importantes:
- Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- Frontend: `NEXT_PUBLIC_API_URL`

Usuários de teste

- Admin: `admin@example.com` / `123456`
- Cliente: `user@example.com` / `123456`

Deploys

- Frontend: https://ux-software.vercel.app
- Backend: https://ux-software.onrender.com
