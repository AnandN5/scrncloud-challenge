import axios from 'axios';
import logger from '../utils/logger';
import { GetStockFilters } from '../interfaces/inventory.interface';
import { Warehouse } from '../interfaces/warehouse.interface';

const WAREHOUSE_SERVICE_URL = process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:3006/warehouses'; // Replace with actual URL

const getWarehouses = async (filters: GetStockFilters) => {
    try {
        if (!filters || !filters.warehouse_ids || filters.warehouse_ids.length === 0) {
            logger.warn('InventoryService: No warehouse IDs provided for fetching warehouses with stock');
            return [];
        }

        const response = await axios.post(`${WAREHOUSE_SERVICE_URL}/search`, { ids: filters.warehouse_ids });
        logger.info('Fetched warehouses successfully', response.data);
        return response.data.data as Warehouse[];
    } catch (error) {
        throw new Error(`Error fetching warehouses from WarehouseService: ${error}`);
    }
};

export default {
    getWarehouses,
};