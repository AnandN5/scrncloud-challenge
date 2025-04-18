import { NextFunction, Request, Response } from "express";
import warehouseService from "../services/warehouse.service";
import { handleResponse } from "../middlewares/reponse.handler";

const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body
        const warehouses = await warehouseService.getWarehouses({ ids });
        handleResponse(res, 200, warehouses);
    } catch (error) {
        next(error);
    }
};

const addWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const warehouse = req.body;
        const newWarehouse = await warehouseService.addWarehouse(warehouse);
        handleResponse(res, 201, newWarehouse);
    } catch (error) {
        next(error);
    }
};

export default {
    getWarehouses,
    addWarehouse,
};