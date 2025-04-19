import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';

const router = Router();

// Route to add a new inventory
router.post('/', inventoryController.addInventory);

// Route to get inventories (with optional filters)
router.get('/', inventoryController.getInventories);

// Route to get stock information
router.get('/stock', inventoryController.getStock);

// Route to update an inventory (PATCH)
router.put('/:id', inventoryController.updateInventory);

// Route to reserve stock
router.post('/reserve', inventoryController.reserveStock);

export default router;
