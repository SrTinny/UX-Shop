// src/index.ts
import express from 'express';
import productRoutes from './modules/products/product.routes';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/errorHandler';
import cartRoutes from './modules/cart/cart.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// auth
app.use('/auth', authRoutes);

// products
app.use('/products', productRoutes);

// cart
app.use('/cart', cartRoutes);


app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'));
app.use(errorHandler);

app.listen(port, () => console.log(`Server http://localhost:${port}`));