import dbConnection from "../config/postgresdb";
import { WarehouseFilters, Warehouse } from "../interfaces/warehouse.interface";
import getRepository from "../repositories/repository";
import { calculateHaversineDistanceBatch } from "../utils/helpers";

const addWarehouse = async (warehouse: Warehouse): Promise<Warehouse> => {
    const warehouseRepository = getRepository(dbConnection);
    try {
        const newWarehouse = await warehouseRepository.addWarehouse(warehouse);
        return newWarehouse;
    }
    catch (error) {
        throw error;
    }
}

const getWarehouses = async (options?: WarehouseFilters): Promise<Warehouse[]> => {
    const warehouseRepository = getRepository(dbConnection);
    try {
        const warehouses = await warehouseRepository.getWarehouses(options);
        if (!warehouses || warehouses.length === 0) {
            return [];
        }
        return warehouses;
    }
    catch (error) {
        throw error;
    }
}

export default {
    getWarehouses,
    addWarehouse,
};