import { Inventory, InventoryFilters, InventoryUpdateFilters } from "../interfaces/inventory.interface";
import dbConnection from "../config/postgresdb";
import logger from "../utils/logger";
import getRepository from "../repositories/repository";

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

export default {
    addInventory,
    getInventories,
    updateInventory
}