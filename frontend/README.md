```markdown
# 🛒 Frontend - Loja Fullstack

Este é o **frontend** do projeto de e-commerce desenvolvido com **Next.js 14 (App Router)**, **React**, **TypeScript** e **TailwindCSS v4**.  
Ele se comunica com a API backend (NestJS + Prisma) para gerenciar produtos, carrinho e autenticação de usuários.

---

## 🚀 Tecnologias Utilizadas
- [Next.js 14](https://nextjs.org/) (App Router, Client Components)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS v4](https://tailwindcss.com/) (com paleta customizada)
- [Axios](https://axios-http.com/) (requisições HTTP)
- [React Hook Form](https://react-hook-form.com/) (controle de formulários)
- [Zod](https://zod.dev/) (validação de dados)
- [IMask](https://imask.js.org/) (máscaras de CPF/telefone)
- [Sonner](https://sonner.emilkowal.ski/) (notificações/toasts)

---

## 📂 Estrutura de Pastas (principais)
```

frontend/
├── app/
│   ├── login/           → página de login
│   ├── register/        → página de registro
│   ├── products/        → listagem de produtos (cliente)
│   ├── cart/            → carrinho de compras
│   └── admin/products/  → CRUD de produtos (admin)
├── lib/
│   ├── api.ts           → configuração do Axios
│   └── auth.ts          → helpers de autenticação
├── styles/
│   └── globals.css      → estilos globais (Tailwind)
└── tailwind.config.ts   → customização de cores e tema

````

---

## ⚙️ Funcionalidades Implementadas
### 👤 Autenticação
- Login e logout com JWT.
- Registro de novos usuários.
- Redirecionamento automático se o usuário não estiver autenticado.
- Proteção de rotas administrativas.

### 🛒 Loja (usuário)
- Listagem de produtos com busca e paginação.
- Busca com **debounce** e botão "Buscar".
- Skeleton loading enquanto carrega.
- Adição de produtos ao carrinho com atualização otimista do badge.
- Página de carrinho mostrando itens e quantidades.

### 🛠️ Admin
- CRUD completo de produtos:
  - Criar, editar, remover.
  - Formulário validado com **React Hook Form + Zod**.
  - `z.coerce.number()` para validar preço/estoque como números.
  - Cancelar edição e reset automático.
- Tabela com skeleton enquanto carrega.

### 📝 Registro
- Formulário com os campos:
  - Nome, e-mail, CPF, telefone, senha e confirmação de senha.
- Máscaras de CPF e telefone com **IMask**.
- Validação avançada:
  - CPF válido.
  - Senhas iguais.
  - E-mail válido.
  - Telefone com dígitos suficientes.
- Simulação de CPF duplicado usando `localStorage`.

### 🎨 UI/UX
- TailwindCSS v4 com **paleta customizada** (`brand`, `accent`, `neutral`).
- Classes globais (`btn`, `btn-primary`, `input-base`, `card`).
- Layout responsivo com grid/flex.
- Feedback imediato com toasts (`sonner`).

---

## ▶️ Como Rodar o Projeto

### Pré-requisitos
- Node.js (>= 18)
- npm ou yarn
- Backend rodando em paralelo ([link para o repositório do backend](../backend))

### Passos
```bash
# Clonar o repositório
git clone <url-do-repo>
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo e defina a URL da API, ex:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Rodar o servidor de desenvolvimento
npm run dev

# Acessar no navegador
http://localhost:3000
````

---

## 🔑 Usuários de Teste

* **Admin**

  * Email: `admin@example.com`
  * Senha: `123456`
* **Cliente**

  * Email: `user@example.com`
  * Senha: `123456`

---

## 📸 Telas

* Login / Registro
* Produtos (cliente)
* Carrinho
* Admin - Produtos (CRUD)

---

## ✅ Requisitos Atendidos

Este frontend cobre os pontos exigidos no teste de **Desenvolvedor Front-End**:

* Consumo de API real (CRUD, auth, carrinho).
* Formulários com validação e máscaras.
* Padrões de UI/UX modernos.
* Proteção de rotas.
* Uso de ferramentas atuais (React, Next.js, Tailwind, Zod, RHF).

---

```
```
