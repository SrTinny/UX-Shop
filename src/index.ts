import express from 'express';
import productRoutes from './modules/products/product.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// rotas
app.use('/products', productRoutes);

// ping
app.get('/', (_req, res) => res.send('🚀 Servidor rodando com TypeScript!'));

// middleware de erro sempre depois das rotas
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
