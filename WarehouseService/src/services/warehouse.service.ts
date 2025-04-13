import dbConnection from "../config/postgresdb";
import { PotentialWarehouseResponse, Warehouse } from "../interfaces/warehouse.interface";
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

const getWarehouses = async (): Promise<Warehouse[]> => {
    const warehouseRepository = getRepository(dbConnection);
    try {
        const warehouses = await warehouseRepository.getWarehouses();
        return warehouses;
    }
    catch (error) {
        throw error;
    }
}

/**
 * Get potential warehouses that can ship the order based on the source latitude and longitude
 * and the warehouse ids that contains the devices 
 * @param ids ids of the warehouses that contains the devices
 * @param sourceLatitude latitude of order source
 * @param sourceLongitude longitude of order sourcekm
 * @returns Array of potential warehouses that can ship the order and the distance to the source
 */
const getPotentialWarehouses = async (ids: string[], sourceLatitude: number, sourceLongitude: number): Promise<PotentialWarehouseResponse[]> => {
    const warehouseRepository = getRepository(dbConnection);
    try {
        const warehouses = await warehouseRepository.getWarehouseByIds(ids);
        if (!warehouses || warehouses.length === 0) {
            return [];
        }
        const potentialWarehouses = calculateHaversineDistanceBatch(warehouses, sourceLatitude, sourceLongitude);
        return potentialWarehouses
    }
    catch (error) {
        throw error;
    }
}

export default {
    getWarehouses,
    addWarehouse,
    getPotentialWarehouses
};