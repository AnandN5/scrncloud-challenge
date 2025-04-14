import { GetStockFilters, GetStockResponse, Inventory, InventoryFilters, InventoryUpdateFilters } from "../interfaces/inventory.interface";
import dbConnection from "../config/postgresdb";
import logger from "../utils/logger";
import getRepository from "../repositories/repository";
import warehouseService from "./warehouse.service";

const addInventory = async (inventory: Inventory): Promise<Inventory> => {
    try {
        // Implementation for adding a inventory to PostgreSQL
        if (!inventory) {
            throw new Error("Inventory data is required");
        }

        const inventoriesRepository = getRepository(dbConnection);

        const newInventory = await inventoriesRepository.addInventory(inventory);
        return newInventory;
    }
    catch (error) {
        console.error("Error adding inventory to db", error);
        logger.error("Error adding inventory to db", error);
        throw error;
    }
}

const getInventories = async (options?: InventoryFilters): Promise<Inventory[]> => {
    const inventoryRepository = getRepository(dbConnection);
    try {
        const inventory = await inventoryRepository.getInventory(options);
        return inventory;
    }
    catch (error) {
        console.error("Error fetching inventory from db", error);
        logger.error("Error fetching inventory from db", error);
        throw error;
    }
}

const updateInventory = async (id: string, inventoryUpdate: InventoryUpdateFilters): Promise<Inventory> => {
    const inventoryRepository = getRepository(dbConnection);
    try {
        const inventoryItem = await inventoryRepository.getInventory({ id });
        if (!inventoryItem || inventoryItem.length === 0) {
            logger.error(`Inventory with id ${id} not found for updation`);
            throw new Error(`Inventory with id ${id} not found`);
        }
        if (!inventoryUpdate) {
            logger.error("Inventory update data is required for updation");
            throw new Error("Inventory update data is required");
        }
        // Ensure the ID is included in the update
        const updatedInventory = await inventoryRepository.updateInventory(id, inventoryUpdate);
        return updatedInventory;
    }
    catch (error) {
        console.error("Error updating inventory in db", error);
        logger.error("Error updating inventory in db", error);
        throw error;
    }
}

const getStock = async (filters: GetStockFilters): Promise<GetStockResponse[]> => {
    const inventoryRepository = getRepository(dbConnection);
    try {
        const stocks = await inventoryRepository.getInventory(filters);

        if (!stocks || stocks.length === 0) {
            logger.info("No stock found for the given filters", filters);
            return []
        }

        const warehouseIdsWithStock = stocks.map((item) => item.warehouse_id);
        const uniqueWarehouseIds = [...new Set(warehouseIdsWithStock)];
        logger.info("Unique warehouse IDs with stock", uniqueWarehouseIds);

        const warehouses = await warehouseService.getWarehouses({ warehouse_ids: uniqueWarehouseIds });
        if (!warehouses || warehouses.length === 0) {
            logger.info("Inventory Services: No warehouses found for the given stock");
            return []
        }


        const stockResponse: GetStockResponse[] = [];
        for (let i = 0; i < stocks.length; i++) {
            const stockItem = stocks[i];
            const warehouse = warehouses.find((wh) => wh.id === stockItem.warehouse_id);
            if (warehouse) {
                const stockData: GetStockResponse = {
                    device_id: stockItem.device_id,
                    warehouse,
                    stock: stockItem.stock,
                };
                stockResponse.push(stockData);
            }
        }
        return stockResponse;
    }
    catch (error) {
        throw error;
    }
}

export default {
    addInventory,
    getInventories,
    updateInventory,
    getStock,
}