// src/modules/products/product.routes.ts
import { Router } from 'express';
import * as c from './product.controller';
import { authMiddleware, adminGuard } from '../../middlewares/auth';
import { csrfProtection } from '../../middlewares/csrf';

const router = Router();

router.get('/', c.listProducts);
router.get('/:id', c.getProduct);

// protegido
router.post('/', csrfProtection, authMiddleware, adminGuard, c.createProduct);
// suportamos tanto PUT quanto PATCH para compatibilidade com clientes
router.put('/:id', csrfProtection, authMiddleware, adminGuard, c.updateProduct);
router.patch('/:id', csrfProtection, authMiddleware, adminGuard, c.updateProduct);
router.delete('/:id', csrfProtection, authMiddleware, adminGuard, c.deleteProduct);

export default router;
