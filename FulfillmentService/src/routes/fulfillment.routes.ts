import { Router, Request, Response  } from 'express';
import fulfillmentController from '../controllers/fulfillment.controller';

const router = Router();

router.post('/dry-run', fulfillmentController.handleFulfillmentDryRun);

export default router;