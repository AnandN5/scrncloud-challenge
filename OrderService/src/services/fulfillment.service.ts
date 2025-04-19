import axios from 'axios';
import { FulfillmentDryRunResponse, FulfillmentFilters } from '../interfaces/fulfillment.interface';
import logger from '../utils/logger';
import { ServiceDiscovery } from '../utils/constants';

export const getFulfillmentDryRun = async (filters: FulfillmentFilters): Promise<FulfillmentDryRunResponse> => {
  try {
    const fulfillmentServiceUrl = `${ServiceDiscovery.FULFILLMENT_SERVICE}/dry-run`;
    const response = await axios.post(fulfillmentServiceUrl,  filters );
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching fulfillment:', error);
    throw new Error('Failed to fetch fulfillment from InventoryService');
  }
};

export default {
    getFulfillmentDryRun,
};