import express from 'express'
import cors, { CorsOptions } from 'cors'
import productRoutes from './modules/products/product.routes'
import authRoutes from './modules/auth/auth.routes'
import cartRoutes from './modules/cart/cart.routes'
import { errorHandler } from './middlewares/errorHandler'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

/* ============== CORS ============== */
// Domínios fixos
const staticAllowed = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ux-software.vercel.app',
].filter(Boolean)

// Aceita também quaisquer *previews* do Vercel do seu projeto
const vercelPreviewRe = /^https:\/\/ux-software(?:-[a-z0-9-]+)?\.vercel\.app$/i

if (process.env.FRONTEND_URL) staticAllowed.push(process.env.FRONTEND_URL)

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true) // curl/healthchecks
    if (staticAllowed.includes(origin) || vercelPreviewRe.test(origin)) {
      return cb(null, true)
    }
    return cb(new Error(`Origin not allowed by CORS: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// ✅ Aplica CORS globalmente (inclui preflight nas rotas)
app.use(cors(corsOptions))

/* Rotas públicas */
app.use('/auth', authRoutes)

/* Rotas protegidas / públicas */
app.use('/products', productRoutes)
app.use('/cart', cartRoutes)

app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'))

// Handler de erro
app.use(errorHandler)

app.listen(port, () => console.log(`✅ Server rodando na porta ${port}`))
