import axios from 'axios';
import { Discount } from '../interfaces/discount.interface';
import logger from '../utils/logger';
import { ServiceDiscovery } from '../utils/constants';

export const getDiscountByOrderItem = async (device_id: string, quantity: number): Promise<Discount> => {
  try {
    const response = await axios.get(`${ServiceDiscovery.DISCOUNT_SERVICE}/${device_id}`, { params: { volume: quantity } });
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching discount:', error);
    throw new Error('Failed to fetch discount from DiscountService');
  }
};

export default {
    getDiscountByOrderItem,
};