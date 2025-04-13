import { NextFunction, Request, Response } from "express";
import inventoryService from "../services/inventory.service";
import { handleResponse } from "../middlewares/reponse.handler";

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

export default {
    addInventory,
    getInventories,
    updateInventory,
};