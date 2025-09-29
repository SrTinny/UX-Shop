# 🛍️ Projeto Fullstack - Loja Online

Este é um projeto **Fullstack** que implementa uma **loja online com autenticação, carrinho de compras e área administrativa**, utilizando tecnologias modernas no **frontend** e no **backend**.  
O projeto foi desenvolvido com foco em **boas práticas**, **UX aprimorada** e **deploy em nuvem**.
---

## 🚀 Tecnologias Utilizadas
### 🔹 Frontend
- **Next.js 14 (App Router)**
- **React 18 + TypeScript**
- **TailwindCSS v4** (tema customizado)
- **Axios** (requisições HTTP)
- **React Hook Form + Zod** (formulários com validação)
- **IMask** (máscaras de CPF/telefone)
- **Sonner** (notificações/toasts)

### 🔹 Backend
- **Express + TypeScript**
- **Prisma ORM**
- **PostgreSQL (NeonDB)** – banco de dados em nuvem
- **JWT** (autenticação)
- **bcrypt** (hash de senhas)
- **Middleware de erros customizado**
- **CORS configurado dinamicamente** para múltiplos domínios

### 🔹 Deploy/Infra
- **Render** → hospedagem do backend (API)
- **Vercel** → hospedagem do frontend
- **Neon** → banco de dados PostgreSQL escalável em nuvem

---

## 📂 Estrutura do Projeto

```markdown
/ (raiz)
├── frontend/   → Aplicação Next.js (cliente + admin)
├── backend/    → API Express (autenticação, produtos, carrinho)
└── README.md   → Este arquivo

````

Cada pasta contém seu próprio `README.md` com instruções detalhadas:
- [Frontend/README.md](./frontend/README.md)
- [Backend/README.md](./backend/README.md)

---

## ⚙️ Funcionalidades Principais
- **Autenticação de usuários**
  - Login e registro
  - Validação de CPF e telefone
  - Senhas criptografadas com bcrypt
  - Proteção de rotas com JWT
- **Loja (usuário)**
  - Listagem e busca de produtos (com debounce e skeleton loading)
  - Adição de itens ao carrinho
  - Quantidade de itens exibida em badge
- **Admin**
  - CRUD de produtos (criar, editar, remover)
  - Validação com React Hook Form + Zod
  - Controle de acesso (apenas administradores)
- **UI/UX**
  - Landing page inicial estilizada com descrição do sistema
  - TailwindCSS com paleta de cores personalizada
  - Feedback de ações com toasts
  - Layout responsivo e acessível
- **Infra**
  - Deploy automatizado no **Render** (backend) e **Vercel** (frontend)
  - Banco de dados persistente no **Neon**
  - Variáveis de ambiente para configurar domínios permitidos no CORS

---

## ▶️ Como Rodar o Projeto

### Pré-requisitos
- Node.js **>= 18**
- PostgreSQL local ou conta no **NeonDB**
- npm ou yarn

### Passos
```bash
# Clonar o repositório
git clone <url-do-repo>
cd projeto-fullstack

# Instalar dependências em cada parte
cd backend && npm install
cd ../frontend && npm install
````

### Configurar variáveis de ambiente

* Backend: `backend/.env`

  * `DATABASE_URL` (string de conexão do PostgreSQL/Neon)
  * `JWT_SECRET`
  * `FRONTEND_URL` (domínio do frontend para o CORS)
* Frontend: `frontend/.env.local`

  * `NEXT_PUBLIC_API_URL` (ex: `http://localhost:3001` ou URL do Render)

### Rodar o backend

```bash
cd backend
npm run dev
```

### Rodar o frontend

```bash
cd frontend
npm run dev
```

Acesse em:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:3001](http://localhost:3001)

---

## 🔑 Usuários de Teste

* **Admin**

  * Email: `admin@example.com`
  * Senha: `123456`

* **Cliente**

  * Email: `user@example.com`
  * Senha: `123456`

---

## ✅ Requisitos Atendidos

Este projeto cobre os pontos exigidos tanto para **Desenvolvedor Back-End** quanto **Desenvolvedor Front-End**:

* CRUD de produtos
* Autenticação com JWT
* Carrinho de compras
* Área administrativa
* Validação de dados
* Integração frontend ↔ backend
* Boas práticas de UI/UX
* Deploy completo em nuvem (frontend, backend e banco)

---

## 🌐 Deploys

* **Frontend (Vercel):** [https://ux-software.vercel.app](https://ux-software.vercel.app)
* **Backend (Render):** [https://ux-software.onrender.com](https://ux-software.onrender.com)
* **Banco de Dados (Neon):** PostgreSQL em nuvem

---
