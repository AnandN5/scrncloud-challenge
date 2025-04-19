import { getStock } from './inventory.service';
import { FulfillmentPlan, FulfillmentDryRunResponse, FulfillmentDryRunFilters } from '../interfaces/fulfillment.interface';
import logger from '../utils/logger';
import { sortStockByWarehouseDistance } from '../utils/helpers'
import warehouseService from './warehouse.service';
import { StockWithWarehouseDistance } from '../interfaces/inventory.interface';

/**
 * Main function to process fulfillment dry run.
 */
const processFulfillmentDryRun = async (orderDetails: FulfillmentDryRunFilters): Promise<FulfillmentDryRunResponse> => {
    let fulfillmentDryRun = {
        fulfillment_status: "NOT_FULFILLABLE"
    } as FulfillmentDryRunResponse;

    try {
        // Fetch stock details
        const stockResponse = await fetchStock(orderDetails.device_id);
        if (!stockResponse || stockResponse.length === 0) {
            logger.warn('No stock found for the given device ID');
            return fulfillmentDryRun;
        }

        // Fetch warehouse details
        const warehouses = await fetchWarehouses(stockResponse);
        if (!warehouses || warehouses.length === 0) {
            logger.warn('No warehouses found for the given stock');
            return fulfillmentDryRun;
        }

        // Map stock to warehouse details
        const stocksWithWarehouseDetails = mapStockToWarehouses(stockResponse, warehouses);

        // Sort stocks by distance
        const sortedStocks = sortStockByWarehouseDistance(
            stocksWithWarehouseDetails,
            orderDetails.order_latitude,
            orderDetails.order_longitude
        );

        // Generate fulfillment plan
        const fulfillmentPlanResult = generateFulfillmentPlan(sortedStocks, orderDetails.quantity_requested);
        if (!fulfillmentPlanResult.fulfillable) {
            logger.warn('The order is not fulfillable');
            return fulfillmentDryRun;
        }

        // Return fulfillment plan
        fulfillmentDryRun.fulfillment_plan = fulfillmentPlanResult.fulfillmentPlan;
        fulfillmentDryRun.fulfillment_status = "FULFILLABLE";
        return fulfillmentDryRun;
    } catch (error) {
        logger.error('Error processing fulfillment dry run:', error);
        return fulfillmentDryRun;
    }
};

/**
 * Fetch stock details from the InventoryService.
 */
const fetchStock = async (device_id: string) => {
    if (!device_id) {
        throw new Error('Device ID is required to fetch stock');
    }
    return await getStock({ device_ids: [device_id] });
};

/**
 * Fetch warehouse details from the WarehouseService.
 */
const fetchWarehouses = async (stockResponse: { warehouse_id: string }[]) => {
    const warehouse_ids = stockResponse.map(stock => stock.warehouse_id);
    return await warehouseService.getWarehouses(warehouse_ids);
};

/**
 * Map stock data to warehouse details.
 */
const mapStockToWarehouses = (
    stockResponse: { device_id: string; stock: number; warehouse_id: string }[],
    warehouses: { id: string; name: string; latitude: number; longitude: number }[]
): StockWithWarehouseDistance[] => {
    const warehouseMap = new Map(warehouses.map(warehouse => [warehouse.id, warehouse]));
    const stocksWithWarehouseDetails: StockWithWarehouseDistance[] = []
    stockResponse
        .filter(stock => warehouseMap.has(stock.warehouse_id))
        .map(stock => {
            const warehouse = warehouseMap.get(stock.warehouse_id);
            if (warehouse) {
                stocksWithWarehouseDetails.push({
                    device_id: stock.device_id,
                    stock: stock.stock,
                    warehouse,
                    distance: 0,
                });
            }
        });
    return stocksWithWarehouseDetails
};

/**
 * Generate the fulfillment plan based on sorted stocks and requested quantity.
 */
const generateFulfillmentPlan = (
    stocks: StockWithWarehouseDistance[],
    quantity_requested: number
): { fulfillmentPlan: FulfillmentPlan[]; fulfillable: boolean } => {
    // Step 1: Validate the requested quantity
    if (!isValidQuantity(quantity_requested)) {
        logger.warn('Invalid quantity requested');
        return { fulfillmentPlan: [], fulfillable: false };
    }

    // Step 2: Check if there is enough stock available
    const totalAvailableStock = calculateTotalAvailableStock(stocks);
    if (totalAvailableStock < quantity_requested) {
        logger.warn(`Not enough stock available to fulfill the order. Available: ${totalAvailableStock}, Requested: ${quantity_requested}`);
        return { fulfillmentPlan: [], fulfillable: false };
    }

    // Step 3: Generate the fulfillment plan
    const fulfillmentPlan = allocateStockToFulfillmentPlan(stocks, quantity_requested);

    return { fulfillmentPlan, fulfillable: true };
};

/**
 * Validate the requested quantity.
 */
const isValidQuantity = (quantity_requested: number): boolean => {
    return quantity_requested > 0;
};

/**
 * Calculate the total available stock from all warehouses.
 */
const calculateTotalAvailableStock = (stocks: StockWithWarehouseDistance[]): number => {
    return stocks.reduce((acc, stock) => acc + stock.stock, 0);
};

/**
 * Allocate stock from warehouses to fulfill the requested quantity.
 */
const allocateStockToFulfillmentPlan = (
    stocks: StockWithWarehouseDistance[],
    quantity_requested: number
): FulfillmentPlan[] => {
    const fulfillmentPlan: FulfillmentPlan[] = [];
    let remainingQuantity = quantity_requested;

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
    }

    return fulfillmentPlan;
};

export default {
    processFulfillmentDryRun,
}