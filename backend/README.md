# Backend - UX Software (API)

API em Node.js + TypeScript com Express e Prisma. Fornece endpoints de auth, produtos e carrinho.

Stack
- Node.js, TypeScript, Express, Prisma
- Zod para validação, JWT para autenticação

Estrutura (resumo)

```markdown
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
      product.service.ts
    cart/
      cart.controller.ts
      cart.routes.ts
      cart.schemas.ts
  index.ts
prisma/
  migrations/
  schema.prisma
  seed.ts

