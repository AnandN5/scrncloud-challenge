import { NextFunction, Request, Response } from "express";
import inventoryService from "../services/inventory.service";
import { handleResponse } from "../middlewares/reponse.handler";
import { GetStockFilters } from "../interfaces/inventory.interface";

const addInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const inventoryData = req.body;
        const newInventory = await inventoryService.addInventory(inventoryData);
        handleResponse(res, 201, newInventory);
    } catch (error) {
        next(error);
    }
};

const getInventories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = req.query; // Extract filters from query parameters
        const inventories = await inventoryService.getInventories(filters);
        handleResponse(res, 200, inventories);
    } catch (error) {
        next(error);
    }
};

const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Extract inventory ID from URL parameters
        const inventoryUpdate = req.body; // Extract fields to update from request body
        const updatedInventory = await inventoryService.updateInventory(id, inventoryUpdate);
        handleResponse(res, 200, updatedInventory);
    } catch (error) {
        next(error);
    }
};

const getStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let device_ids: string[]
        if (req.query.device_ids) {
            const deviceIdsParam = req.query.device_ids as string;

            // Handle comma-separated UUIDs
            device_ids = deviceIdsParam.split(",");

            if (device_ids.length > 0) {
                const stock = await inventoryService.getStock({device_ids, filter_stockless: req.query.filter_stockless} as GetStockFilters);
                handleResponse(res, 200, stock);
            }
        } else {
            return handleResponse(res, 400, { message: "device_ids query parameter is required" });
        }
    } catch (error) {
        next(error);
    }
};

export default {
    addInventory,
    getInventories,
    updateInventory,
    getStock,
};