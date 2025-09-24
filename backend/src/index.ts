// src/index.ts
import express from 'express';
import cors from 'cors';
import productRoutes from './modules/products/product.routes';
import authRoutes from './modules/auth/auth.routes';
import cartRoutes from './modules/cart/cart.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Next em 3000 ou 3001
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2) body parser
app.use(express.json());

// 3) rotas
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);

// 4) health e error handler
app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'));
app.use(errorHandler);

app.listen(port, () => console.log(`Server http://localhost:${port}`));
