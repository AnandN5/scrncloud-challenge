import { FulfillmentDryRunFilters } from "../interfaces/fulfillment.interface";
import e, { NextFunction, Request, Response } from "express";
import fulfillmentService from "../services/fulfillment.service";
import { handleResponse } from "../middlewares/reponse.handler";

const handleFulfillmentDryRun = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params: FulfillmentDryRunFilters = {
            device_id: req.body.device_id,
            quantity_requested: req.body.quantity_requested,
            order_latitude: req.body.order_latitude,
            order_longitude: req.body.order_longitude,
        }
        const result = await fulfillmentService.processFulfillmentDryRun(params);
        handleResponse(res, 200, result);
    } catch (error) {
        next(error);
    }
}

export default {
    handleFulfillmentDryRun
}