# Frontend - UX Software

Frontend da aplicação (Next.js + React + TypeScript). Consome a API do backend para produtos, carrinho e auth.

Tecnologias principais
- Next.js (App Router), React, TypeScript, TailwindCSS
- Axios, React Hook Form, Zod, Sonner

Estrutura (resumo)

```markdown
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

      Como rodar (resumo)

      1. Instalar dependências

      ```powershell
      cd "C:\Users\joaov\Documents\Projetos\UX Software\frontend"
      npm install
      ```

      2. Rodar em desenvolvimento

      ```powershell
      npm run dev
      ```

      Variável importante: `NEXT_PUBLIC_API_URL`

      Usuários de teste

      - Admin: `admin@example.com` / `123456`
      - Cliente: `user@example.com` / `123456`

      Deploy

      - Frontend: https://ux-software.vercel.app


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
