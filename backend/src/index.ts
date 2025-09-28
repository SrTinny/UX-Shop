import express from 'express';
import cors from 'cors';
import productRoutes from './modules/products/product.routes';
import authRoutes from './modules/auth/auth.routes';
import cartRoutes from './modules/cart/cart.routes';
import { errorHandler } from './middlewares/errorHandler';
import dotenv from 'dotenv';

dotenv.config(); // 🔹 carrega variáveis do .env

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas / públicas
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'));

// Handler de erro
app.use(errorHandler);

app.listen(port, () => console.log(`✅ Server rodando na porta ${port}`));
