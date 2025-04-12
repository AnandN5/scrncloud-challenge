
// Handler to standardize the response format

import { Response } from "express";

// for all API responses in the application.
export const handleResponse = (res: Response, status: number, message: string, data: any = null) => {
    res.status(status).json({
      status,
      message,
      data,
    });
  };