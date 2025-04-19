// Handler to standardize the response format

import { Response } from 'express';

// for all API responses in the application.
export const handleResponse = (
    res: Response,
    status: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any = null
) => {
    res.status(status).json({
        data
    });
};
