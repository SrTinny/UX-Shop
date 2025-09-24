// src/modules/products/product.routes.ts
import { Router } from 'express';
import * as c from './product.controller';
import { authMiddleware, adminGuard } from '../../middlewares/auth';

const router = Router();

router.get('/', c.listProducts);
router.get('/:id', c.getProduct);

// protegido
router.post('/', authMiddleware, adminGuard, c.createProduct);
router.put('/:id', authMiddleware, adminGuard, c.updateProduct);
router.delete('/:id', authMiddleware, adminGuard, c.deleteProduct);

export default router;
