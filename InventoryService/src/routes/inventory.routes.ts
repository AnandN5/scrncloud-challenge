import { Router, Request, Response  } from 'express';
import inventoryController from '../controllers/inventory.controller';

const router = Router();

// Route to add a new inventory
router.post('/', inventoryController.addInventory);

// Route to get inventories (with optional filters)
router.get('/', inventoryController.getInventories);

// Route to update an inventory (PATCH)
router.put('/:id', inventoryController.updateInventory);

export default router;