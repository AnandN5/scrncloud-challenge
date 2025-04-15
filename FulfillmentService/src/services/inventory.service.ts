import axios from 'axios';
import { GetStockResponse } from '../interfaces/inventory.interface';
import logger from '../utils/logger';

const INVENTORY_SERVICE_URL = 'http://localhost:3007/inventories'; // Replace with the actual InventoryService URL

export const getStock = async (filters: { device_ids?: string[] }): Promise<GetStockResponse[]> => {
  try {
    const params: { device_ids?: string, filter_stockless: boolean } = { filter_stockless: true };
    if (filters.device_ids) {
      params.device_ids = filters.device_ids.join(',');
    }
    const response = await axios.get(`${INVENTORY_SERVICE_URL}/stock`, { params });
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching inventory:', error);
    throw new Error('Failed to fetch inventory from InventoryService');
  }
};

export default {
  getStock,
};