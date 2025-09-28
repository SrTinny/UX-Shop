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
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ux-software.vercel.app',           // <- seu domínio no Vercel
  process.env.FRONTEND_URL || '',             // <- opcional: ler de env
].filter(Boolean)

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // permite requests sem Origin (ex.: curl, healthchecks)
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`Origin not allowed by CORS: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
// responde preflight para qualquer rota
app.options('*', cors(corsOptions))
/* ================================= */

/* Rotas públicas */
app.use('/auth', authRoutes)

/* Rotas protegidas / públicas */
app.use('/products', productRoutes)
app.use('/cart', cartRoutes)

app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'))

// Handler de erro
app.use(errorHandler)

app.listen(port, () => console.log(`✅ Server rodando na porta ${port}`))
