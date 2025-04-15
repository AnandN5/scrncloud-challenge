import { getStock } from './inventory.service';
import { FulfillmentPlan, FulfillmentDryRunResponse, FulfillmentDryRunFilters } from '../interfaces/fulfillment.interface';
import { StockWithWarehouseDistance } from '../types/inventory.types';
import logger from '../utils/logger';
import { sortStockByWarehouseDistance } from '../utils/helpers'

const processFulfillmentDryRun = async (orderDetails: FulfillmentDryRunFilters): Promise<FulfillmentDryRunResponse> => {
    let fulfillmentDryRun = {
        fulfillment_status: "NOT_FULFILLABLE"
    } as FulfillmentDryRunResponse;

    const device_ids: string[] = [orderDetails.device_id];
    if (!device_ids || device_ids.length === 0) {
        return fulfillmentDryRun;
    }

    const stockResponse = await getStock({ device_ids });
    if (!stockResponse || stockResponse.length === 0) {
        return fulfillmentDryRun;
    }

    // calculated distance from the warehouse to the order location
    const sortedStocks: StockWithWarehouseDistance[] = sortStockByWarehouseDistance(stockResponse, orderDetails.order_latitude, orderDetails.order_longitude);

    const fulfillmentPlan = getFulfillmentPlan(sortedStocks, orderDetails.quantity_requested)
    if (!fulfillmentPlan.fulfillable) {
        logger.warn('The order is not fulfillable')
        return fulfillmentDryRun
    }

    fulfillmentDryRun.fulfillment_plan = fulfillmentPlan.fulfillmentPlan;
    fulfillmentDryRun.fulfillment_status = "FULFILLABLE";
    return fulfillmentDryRun;
};

const getFulfillmentPlan = (stocks: StockWithWarehouseDistance[], quantity_requested: number): { fulfillmentPlan: FulfillmentPlan[], fulfillable: boolean } => {

    const fulfillmentPlan: FulfillmentPlan[] = [];

    // Use quantity_requested from the order details and identify the warehouses in sortedStock that can fulfill
    // the order. Calculate the total shipping cost based on the distance and quantity.
    const requested_quantity = quantity_requested;
    if (requested_quantity <= 0) {
        return { fulfillmentPlan, fulfillable: false }; // Invalid quantity requested
    }

    const totalAvailableStock = stocks.reduce((acc, stock) => acc + stock.stock, 0);
    if (totalAvailableStock < requested_quantity) {
        logger.warn(`Not enough stock available to fulfill the order. Available: ${totalAvailableStock}, Requested: ${requested_quantity}`);
        return { fulfillmentPlan, fulfillable: false }; // Not enough stock to fulfill the order
    }

    let remainingQuantity = requested_quantity;

    for (const stock of stocks) {
        if (remainingQuantity <= 0) {
            break;
        }

        const availableQuantity = Math.min(stock.stock, remainingQuantity);
        remainingQuantity -= availableQuantity;

        fulfillmentPlan.push({
            warehouse_id: stock.warehouse.id,
            warehouse_name: stock.warehouse.name,
            distance: stock.distance,
            device_id: stock.device_id,
            quantity_requested,
            quantity_fulfilled: availableQuantity,
        });
    }

    if (remainingQuantity > 0) {
        logger.warn(`Not enough stock available to fulfill the order. Remaining quantity: ${remainingQuantity}`);
        return { fulfillmentPlan, fulfillable: false }; // Not enough stock to fulfill the order
    }
    return { fulfillmentPlan, fulfillable: true }
}

export default {
    processFulfillmentDryRun,
}