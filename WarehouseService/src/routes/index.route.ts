import * as express from 'express';
import warehouseRoutes from './warehouse.routes';

const router = express.Router();

router.use('/warehouses', warehouseRoutes)

export default router;