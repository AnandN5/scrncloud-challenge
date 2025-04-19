import { FulfillmentDryRunFilters } from "../interfaces/fulfillment.interface";
import e, { NextFunction, Request, Response } from "express";
import fulfillmentService from "../services/fulfillment.service";
import { handleResponse } from "../middlewares/reponse.handler";

const handleFulfillmentDryRun = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params: FulfillmentDryRunFilters = req.body as FulfillmentDryRunFilters;
        const result = await fulfillmentService.processFulfillmentDryRun(params);
        handleResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export default {
    handleFulfillmentDryRun
}