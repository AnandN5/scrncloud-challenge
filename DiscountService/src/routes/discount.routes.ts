import { Router, Request, Response  } from 'express';
import discountController from '../controllers/discount.controller';

const router = Router();

router.post('/', discountController.addDiscount);
router.get('/', discountController.getDiscounts);
router.get('/:device_id', discountController.getDeviceDiscount);

export default router;