import { NextFunction, Request, Response } from "express";
import { OrderCreateRequest } from "../interfaces/order.interface";
import orderService from "../services/order.service";
import { handleResponse } from "../middlewares/reponse.handler";
import { validateOrderRequest } from "../utils/helpers/order.helpers";

const getOrderReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.body as OrderCreateRequest;
        validateOrderRequest(params);
        if (!params.dry_run) {
            throw new Error("Order is not a dry run");
        }
        const order = await orderService.getOrderReview(params);
        handleResponse(res, 200, order)
    } catch (error) {
        next(error);
    }
}

export default {
    getOrderReview
}