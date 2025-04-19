import axios from 'axios';
import {
    GetStockResponse,
    StockReserveRequest,
} from '../interfaces/inventory.interface';
import { ServiceDiscovery } from '../utils/constants';
import logger from '../utils/logger';

export const getStock = async (filters: {
    device_ids?: string[];
}): Promise<GetStockResponse[]> => {
    try {
        const params: { device_ids?: string; filter_stockless: boolean } = {
            filter_stockless: true,
        };
        if (filters.device_ids) {
            params.device_ids = filters.device_ids.join(',');
        }
        const response = await axios.get(
            `${ServiceDiscovery.INVENTORY_SERVICE}/stock`,
            { params },
        );
        return response.data.data;
    } catch (error) {
        logger.error('Error fetching inventory:', error);
        throw new Error(
            `Failed to fetch inventory from InventoryService with error: ${JSON.stringify(
                (error as Error).message,
            )}`,
        );
    }
};

export const reserveStock = async (
    params: StockReserveRequest[],
): Promise<void> => {
    try {
        const response = await axios.post(
            `${ServiceDiscovery.INVENTORY_SERVICE}/reserve`,
            params,
        );
        if (!Object.keys(response) || response.status !== 200) {
            throw new Error(
                `Failed to reserve stock, Status code: ${response.status}`,
            );
        }
    } catch (error) {
        logger.error('Error reserving stock:', error);
        throw new Error(
            `Failed to reserve stock with error: ${JSON.stringify(
                (error as Error).message,
            )}`,
        );
    }
};

export default {
    getStock,
    reserveStock,
};
