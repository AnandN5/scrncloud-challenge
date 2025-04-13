// Centralized error jandling middleware
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error
    logger.error(err.message, err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
    });
}

export default errorHandler;