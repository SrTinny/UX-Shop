```markdown
# 🛍️ Projeto Fullstack - Loja Online
Ele implementa uma **loja online com autenticação, carrinho de compras e área administrativa**, utilizando tecnologias modernas no **frontend** e no **backend**.

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
- **NestJS**
- **Prisma ORM**
- **PostgreSQL** (banco de dados)
- **JWT** (autenticação)
- **bcrypt** (hash de senhas)
- **Swagger** (documentação da API)

---

## 📂 Estrutura do Projeto
```

/ (raiz)
├── frontend/   → Aplicação Next.js (cliente + admin)
├── backend/    → API NestJS (autenticação, produtos, carrinho)
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
  - TailwindCSS com paleta de cores personalizada
  - Feedback de ações com toasts
  - Layout responsivo e acessível

---

## ▶️ Como Rodar o Projeto

### Pré-requisitos
- Node.js **>= 18**
- PostgreSQL rodando localmente (ou em container)
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

* Backend: `backend/.env` (configuração do banco e JWT_SECRET)
* Frontend: `frontend/.env.local` (definir URL da API, ex: `http://localhost:3001`)

### Rodar o backend

```bash
cd backend
npm run start:dev
```

### Rodar o frontend

```bash
cd frontend
npm run dev
```

Acesse em:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:3001](http://localhost:3001) (Swagger disponível em `/api`)

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

---

```

