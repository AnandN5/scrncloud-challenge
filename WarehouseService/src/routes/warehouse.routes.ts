import { Router } from 'express';
import warehouseController from '../controllers/warehouse.controller';

const router = Router();

router.post('/search', warehouseController.getWarehouses);
router.post('/', warehouseController.addWarehouse);

export default router;