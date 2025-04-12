import { Router } from 'express';
import inventoryRoutes from './inventory.routes';

const router = Router();

// Mount inventory routes
router.use("/inventories", inventoryRoutes);

export default router;