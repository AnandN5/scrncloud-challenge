import * as express from 'express';
import deviceRoutes from './device.routes';


const router = express.Router();

router.use('/devices', deviceRoutes);

export default router;