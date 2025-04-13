import { NextFunction, Response, Request } from "express";
import discountServices from "../services/discount.services";
import { handleResponse } from "../middlewares/reponse.handler";

const addDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const discount = req.body as any;
        if (!discount) {
            throw new Error("Discount data is required");
        }
        const newDiscount = await discountServices.addDiscount(discount);
        return handleResponse(res, 201, newDiscount);
    } catch (error) {
        next(error);
    }
}

const getDiscounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const options = req.query as any;
        const discounts = await discountServices.getDiscounts(options);
        return handleResponse(res, 200, discounts);
    } catch (error) {
        next(error);
    }
}

const getDeviceDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const device_id = req.params.device_id;
        const volume = req.query.volume;
        if (!device_id || !volume) {
            throw new Error("Device ID and volume are required");
        }
        const discount = await discountServices.getDeviceDiscount(device_id, Number(volume));
        if (!discount) {
            return handleResponse(res, 404, "Discount not found");
        }
        return handleResponse(res, 200, discount);
    } catch (error) {
        next(error);
    }
}

export default {
    addDiscount,
    getDiscounts,
    getDeviceDiscount
}