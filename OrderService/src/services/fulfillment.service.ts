import axios from 'axios';
import {
    FulfillmentDryRunResponse,
    FulfillmentFilters,
} from '../interfaces/fulfillment.interface';
import logger from '../utils/logger';
import { ServiceDiscovery } from '../utils/constants';
import { InventoryReservationItem } from '../interfaces/inventory.interface';

export const getFulfillmentDryRun = async (
    filters: FulfillmentFilters,
): Promise<FulfillmentDryRunResponse> => {
    try {
        const fulfillmentServiceUrl = `${ServiceDiscovery.FULFILLMENT_SERVICE}/dry-run`;
        const response = await axios.post(fulfillmentServiceUrl, filters);
        return response.data.data;
    } catch (error) {
        logger.error('Error fetching fulfillment:', error);
        throw new Error('Failed to fetch fulfillment from InventoryService');
    }
};

/**
 * Triggers the fulfillment process of the order.
 * The exact implementation of this workflow is out of scope for the challenge.
 * The fulfillement service will fulfill the order using the reserved items as source of truth,
 * and changes the status of the order to FULFILLED as well as the status of the reservations to FULFILLED.
 * The trigering activity as well as order updation will be done asynchronously using a queue.
 * @param reservations
 */
const triggerFulfillment = (
    reservations: InventoryReservationItem[],
    orderId: string,
) => {
    const updateReservationStatus = reservations.map((reservation) => {
        if (reservation.order_id == orderId) {
            reservation.status = 'FULFILLED';
            return reservation;
        }
    });
    return updateReservationStatus;
};

export default {
    getFulfillmentDryRun,
    triggerFulfillment,
};
