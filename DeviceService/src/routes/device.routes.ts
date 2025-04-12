import { Router, Request, Response  } from 'express';
import deviceController from '../controllers/device.controller';

const router = Router();

// Route to create a new device
router.post('/', deviceController.createDevice);

// Route to get all devices
router.get('/', deviceController.getDevices);

export default router;