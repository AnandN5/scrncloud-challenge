import { Router } from 'express';
import warehouseController from '../controllers/warehouse.controller';

const router = Router();

router.get('/', warehouseController.getWarehouses);
router.post('/', warehouseController.addWarehouse);
router.post('/nearby', warehouseController.getPotentialWarehouses);

export default router;