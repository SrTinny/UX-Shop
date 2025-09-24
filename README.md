---

# 📦 UX Software – API (Node + TypeScript + Express + Prisma + PostgreSQL)

API de e-commerce simplificado com autenticação JWT, roles (`USER`/`ADMIN`), CRUD de produtos e carrinho persistido.

---

## ⚙️ Stack

* **Node.js + TypeScript**
* **Express**
* **Prisma ORM** (PostgreSQL)
* **Zod** (validação)
* **JWT** (auth)
* **ESLint** (qualidade)
* **Insomnia** (testes manuais)

---

## 🗂 Estrutura de pastas

```
src/
  config/
    prisma.ts
  middlewares/
    auth.ts
    errorHandler.ts
  modules/
    auth/
      auth.controller.ts
      auth.routes.ts
      auth.schemas.ts
    products/
      product.controller.ts
      product.routes.ts
    cart/
      cart.controller.ts
      cart.routes.ts
      cart.schemas.ts
  index.ts
prisma/
  schema.prisma
  migrations/
  seed.ts
```

---

## 🚀 Como rodar o projeto

### 1) Pré-requisitos

* Node 18+
* PostgreSQL rodando em `localhost:5432` (ou ajuste no `.env`)

### 2) Instalar dependências

```bash
npm install
```

### 3) Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/ux_software?schema=public"
JWT_SECRET="uma_chave_secreta_forte_aqui"
PORT=3000
NODE_ENV=development
```

> Ajuste usuário/senha/porta conforme seu ambiente.

### 4) Migrations + Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5) Seed (cria um admin)

```bash
npx prisma db seed
```

### 6) Subir a API

```bash
npm run dev
```

Acesse em: [http://localhost:3000](http://localhost:3000) → “🚀 Servidor rodando com TypeScript!”

---

## 🔒 Autenticação & Autorização

* **JWT** via header:
  `Authorization: Bearer <token>`

* **Ativação de conta**: ao registrar, a API imprime no console um link `GET /auth/activate/:token`.

* **Roles:**

  * `USER`: listar produtos, gerenciar carrinho.
  * `ADMIN`: criar, atualizar e deletar produtos.

---

## 🔗 Endpoints

### Health

* `GET /` → retorna “Servidor rodando…”

---

### Auth

#### Registrar

`POST /auth/register`

```json
{
  "name": "João",
  "email": "joao@ux.com",
  "password": "123456"
}
```

Resposta 201:

```json
{
  "message": "Usuário registrado. Verifique o link de ativação no console.",
  "user": { "id": "...", "name": "João", "email": "joao@ux.com", "role": "USER", "isActive": false }
}
```

#### Ativar conta

`GET /auth/activate/:token`

#### Login

`POST /auth/login`

```json
{ "email": "joao@ux.com", "password": "123456" }
```

Resposta 200:

```json
{ "message": "Login realizado com sucesso", "token": "eyJ..." }
```

---

### Produtos

* `GET /products?page=1&perPage=10&search=teclado`
  (público – paginação e busca)

* `GET /products/:id`
  (público – buscar por ID)

* `POST /products` (ADMIN)
  Criar produto:

  ```json
  {
    "name": "Headset Gamer",
    "description": "7.1 Surround",
    "price": 399.9,
    "stock": 12
  }
  ```

* `PUT /products/:id` (ADMIN)
  Atualizar:

  ```json
  { "price": 349.9 }
  ```

* `DELETE /products/:id` (ADMIN)

---

### Carrinho (autenticado)

Necessita `Authorization: Bearer <TOKEN>`

* `GET /cart` → retorna ou cria carrinho do usuário.
* `POST /cart/items` → adiciona item:

  ```json
  { "productId": "<ID_DO_PRODUTO>", "quantity": 2 }
  ```
* `PATCH /cart/items/:itemId` → atualiza quantidade:

  ```json
  { "quantity": 5 }
  ```
* `DELETE /cart/items/:itemId` → remove item.
* `DELETE /cart` → limpa carrinho.

---

## 🧰 Scripts úteis

```bash
# Desenvolvimento
npm run dev

# Lint
npm run lint

# Prisma
npx prisma studio
npx prisma migrate dev --name <nome>
npx prisma generate
npx prisma db seed
```

---

## ❗ Códigos de erro

* **400 Bad Request** → validação Zod falhou.
* **401 Unauthorized** → token ausente/inválido/usuário inativo.
* **403 Forbidden** → sem permissão.
* **404 Not Found** → recurso não existe.
* **409 Conflict** → e-mail já registrado.
* **500 Internal Server Error** → erro inesperado.

---

## 📦 Insomnia (coleção)

Coleção **“UX Software API”** com requests organizados:

* **Auth**: Register, Activate, Login
* **Products**: Listar, Criar (ADMIN), Buscar por ID, Atualizar (ADMIN), Deletar (ADMIN)
* **Cart**: Get, Add Item, Update Qty, Remove Item, (Clear)

**Environments:**

```json
{
  "baseUrl": "http://localhost:3000",
  "token": ""
}
```

Use `Authorization: Bearer {{ token }}`.

---

