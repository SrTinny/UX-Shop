import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth';
import { getCart, addItem, updateItemQuantity, removeItem } from './cart.controller';

const router = Router();
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:itemId', updateItemQuantity);
router.delete('/items/:itemId', removeItem);

export default router;