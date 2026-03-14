# Backend - UX Shop (API)

API em Node.js + TypeScript com Express e Prisma. Fornece endpoints de auth, produtos e carrinho.

Stack
- Node.js, TypeScript, Express, Prisma
- Zod para validação, JWT para autenticação

Autenticação
- Access token em cookie HttpOnly de curta duração
- Refresh token rotativo em cookie HttpOnly
- Proteção CSRF por double-submit token (`X-CSRF-Token`)
- Endpoint de sessão atual em `GET /auth/me`

Variáveis de ambiente relevantes
- `JWT_SECRET` obrigatório
- `JWT_ACCESS_TOKEN_MINUTES` opcional, padrão `15`
- `JWT_REFRESH_TOKEN_DAYS` opcional, padrão `30`
- `AUTH_ACTIVATION_TOKEN_HOURS` opcional, padrão `24`
- `AUTH_COOKIE_SECURE` opcional, padrão `true` em produção
- `AUTH_COOKIE_SAME_SITE` opcional, padrão `none` quando cookie seguro e `lax` em desenvolvimento
- `AUTH_COOKIE_DOMAIN` opcional

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

