import { Router } from 'express';
import * as c from './product.controller';

const router = Router();

router.get('/', c.listProducts);
router.get('/:id', c.getProduct);
router.post('/', c.createProduct);
router.put('/:id', c.updateProduct);
router.delete('/:id', c.deleteProduct);

export default router;
