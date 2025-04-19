// Centralized error jandling middleware
import { Request, Response } from 'express';
import logger from '../utils/logger';

const errorHandler = (err: Error, req: Request, res: Response) => {
    // Log the error
    logger.error(err.message, err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message
    });
};

export default errorHandler;
