import axios from 'axios';
import { Warehouse } from '../interfaces/warehouse.interface';
import logger from '../utils/logger';

const WAREHOUSE_SERVICE_URL = process.env.WAREHOUSE_SERVICE_URL || 'http://localhost:3006/warehouses'; // Replace with actual URL

const getWarehouses = async (warehouse_ids: string[]) => {
    try {
        if (!warehouse_ids || warehouse_ids.length === 0) {
            logger.warn('FulfillmentService: No warehouse IDs provided for fetching warehouses with stock');
            return [];
        }

        const response = await axios.post(`${WAREHOUSE_SERVICE_URL}/search`, { ids: warehouse_ids });
        logger.info('Fetched warehouses successfully', response.data);
        return response.data.data as Warehouse[];
    } catch (error) {
        throw new Error(`Error fetching warehouses from WarehouseService: ${error}`);
    }
};

export default {
    getWarehouses,
};