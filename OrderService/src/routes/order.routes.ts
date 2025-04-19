import { Router } from 'express';
import orderController from '../controllers/order.controller';

const router = Router();

router.post('/review', orderController.getOrderReview);
router.post('/', orderController.placeOrder);

export default router;
