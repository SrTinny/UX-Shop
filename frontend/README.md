```markdown
# 🛒 Frontend - UX Software

Este é o **frontend** do projeto de e-commerce desenvolvido com **Next.js 14 (App Router)**, **React**, **TypeScript** e **TailwindCSS v4**.  
Ele consome a API backend (Express + Prisma + PostgreSQL) para gerenciar **produtos, carrinho e autenticação de usuários**.  
Hospedado na **Vercel**, integrado ao backend no **Render** e banco no **Neon**.

---

## 🚀 Tecnologias Utilizadas
- [Next.js 14](https://nextjs.org/) (App Router, Server/Client Components)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS v4](https://tailwindcss.com/) (tema customizado)
- [Axios](https://axios-http.com/) (requisições HTTP)
- [React Hook Form](https://react-hook-form.com/) (formulários reativos)
- [Zod](https://zod.dev/) (validação de dados)
- [IMask](https://imask.js.org/) (máscaras de CPF/telefone)
- [Sonner](https://sonner.emilkowal.ski/) (toasts/feedback)

---

## 📂 Estrutura de Pastas (principais)

```

frontend/
  app/
    components/ → componentes reutilizáveis de produto
      Button.tsx
      Footer.tsx
      HeaderBar.tsx
      Input.tsx
      Skeleton.tsx
      ThemeToggle.tsx
      useDebounce.ts                 → hook de debounce para buscas
    admin/
      products/
        AdminProductsClient.tsx
        page.tsx
    cart/
      page.tsx
    login/ → página de login
      LoginClient.tsx
      page.tsx
    products/
      page.tsx
    register/ → página de registro
      page.tsx
    favicon.ico
    page.tsx → página inicial
    layout.tsx
    globals.css
  components/                       → componentes reutilizáveis e utilitários
    Header.tsx
    RequireAuth.tsx                 → wrapper para rotas protegidas
  lib/
    api.ts                          → Axios configurado (baseURL, interceptors, retry)
    auth.ts                         → helpers JWT (get/set/clear token, isAdmin, etc.)
    cpf.ts                          → validação/utilitários de CPF
    notify.ts                       → helper para toasts (sonner)
  public/

````

---

## ⚙️ Funcionalidades Implementadas

### 👤 Autenticação
- Login/logout com JWT.
- Registro de novos usuários.
- Redirecionamento se não autenticado.
- Rotas administrativas protegidas.

### 🛒 Loja (usuário)
- Listagem de produtos com **busca e paginação**.
- Busca com **debounce** e botão “Buscar”.
- Skeleton enquanto carrega.
- Adição de produtos ao carrinho com atualização otimista.
- Badge exibindo quantidade de itens.

### 🛠️ Admin
- CRUD de produtos:
  - Criar, editar e excluir.
  - Formulário validado com **RHF + Zod**.
  - Reset automático e opção de cancelar edição.
- Tabela com skeleton loading.

### 📝 Registro
- Formulário com:
  - Nome, e-mail, CPF, telefone, senha, confirmar senha.
- Máscaras de CPF e telefone com **IMask**.
- Validações:
  - CPF válido.
  - Senhas iguais.
  - E-mail válido.
  - Telefone com dígitos suficientes.

### 🎨 UI/UX
- Paleta de cores customizada (`brand`, `accent`, `neutral`).
- Classes utilitárias (`btn`, `btn-primary`, `input-base`, `card`).
- Página inicial estilizada com **gradiente e descrição institucional**.
- Responsivo e acessível.
- Feedback imediato com toasts.

---

## ▶️ Como Rodar o Projeto

### Pré-requisitos
- Node.js (>= 18)
- npm ou yarn
- Backend rodando ([link](../backend))

### Passos
```bash
# Clonar o repositório
git clone <url-do-repo>
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite e defina a URL da API, ex:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Rodar em desenvolvimento
npm run dev

# Acessar
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

* Home (bem-vindo + descrição)
* Login / Registro
* Produtos (listagem + busca)
* Carrinho
* Admin - Produtos (CRUD)

---

## ✅ Requisitos Atendidos

Este frontend cobre os pontos exigidos para **Desenvolvedor Front-End**:

* Consumo da API real (CRUD, auth, carrinho).
* Formulários com validação e máscaras.
* Proteção de rotas.
* UI/UX moderna e responsiva.
* Integração completa com backend no Render + DB no Neon.

---

## 🌐 Deploy

* **Frontend (Vercel):** [https://ux-software.vercel.app](https://ux-software.vercel.app)
* **Backend (Render):** [https://ux-software.onrender.com](https://ux-software.onrender.com)

```
```
