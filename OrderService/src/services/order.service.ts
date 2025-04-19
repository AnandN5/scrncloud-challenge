import dbConnection from '../config/postgresdb';
import { Device } from '../interfaces/device.interface';
import { Discount } from '../interfaces/discount.interface';
import {
    FulfillmentDryRunResponse,
    FulfillmentFilters,
} from '../interfaces/fulfillment.interface';
import {
    FulfillmentResponse,
    Order,
    OrderCreateRequest,
    OrderData,
    OrderItem,
} from '../interfaces/order.interface';
import getOrderRepository from '../repositories/repository';
import {
    fulfillmentStatus,
    MAX_SHIPPING_COST_PERCENTAGE,
    OrderStatus,
    Inventory,
} from '../utils/constants';
import { structureOrderData } from '../utils/helpers/order.data.helpers';
import {
    calculateDiscountedPrice,
    calculateTotalShippingCost,
    shouldProceedWithOrder,
} from '../utils/helpers/order.helpers';
import logger from '../utils/logger';
import deviceService from './device.service';
import discountService from './discount.service';
import fulfillmentService from './fulfillment.service';
import { uuid } from 'uuidv4';
import inventoryService from './inventory.service';
import { inventoryReservationRequestData } from '../utils/helpers/inventory.data.helpers';
import { StockReserveRequest } from '../interfaces/inventory.interface';

const getOrderReview = async (
    order: OrderCreateRequest,
): Promise<OrderData> => {
    try {
        const device = (await deviceService.getDeviceById(
            order.device_id,
        )) as Device;

        if (!device) {
            throw new Error(
                `No device found for the given ID: ${JSON.stringify(order.device_id)}`,
            );
        }

        // Fetching fulfillment data from FulfillmentService
        const fulfillmentData = await triggerFulfillmentDryRun(order);
        if (!fulfillmentData) {
            throw new Error('No fulfillment data found');
        }
        // Early return if the order is not fulfillable
        if (
            fulfillmentData.fulfillment_status ===
            fulfillmentStatus.NOT_FULFILLABLE
        ) {
            logger.info(
                `Order is not fulfillable for device ID: ${order.device_id} and quantity: ${order.quantity}`,
            );
            return {
                status: OrderStatus.NON_FULFILLABLE,
            } as OrderData;
        }
        // Fetching discounts from DiscountService
        let discount: Discount = await discountService.getDiscountByOrderItem(
            order.device_id,
            order.quantity,
        );
        if (Object.keys(discount).length === 0) {
            logger.info(`No discounts found for device ID: ${order.device_id}`);
            discount = undefined as any;
        }

        const orderData = structureOrderData(
            order,
            fulfillmentData,
            device,
            discount,
        );
        if (shouldProceedWithOrder(orderData)) {
            logger.info(
                `Shipping cost percentage is within the limit: ${MAX_SHIPPING_COST_PERCENTAGE}`,
            );
            orderData.status = OrderStatus.APPROVED;
        } else {
            logger.info(
                `Shipping cost percentage exceeds the limit: ${MAX_SHIPPING_COST_PERCENTAGE}`,
            );
            orderData.status = OrderStatus.REJECTED;
        }

        return orderData;
    } catch (error) {
        throw error;
    }
};

const placeOrder = async (orderParams: OrderCreateRequest): Promise<Order> => {
    try {
        const device = (await deviceService.getDeviceById(
            orderParams.device_id,
        )) as Device;

        if (!device) {
            throw new Error(
                `No device found for the given ID: ${JSON.stringify(
                    orderParams.device_id,
                )}`,
            );
        }

        // checking stock
        if (
            (await validateStock(
                orderParams.device_id,
                orderParams.quantity,
            )) === Inventory.StockStatus.OUT_OF_STOCK
        ) {
            logger.info(
                `Insufficient stock for device ID: ${orderParams.device_id}`,
            );
            return {
                status: OrderStatus.NON_FULFILLABLE,
            } as Order;
        }

        // Fetching fulfillment data from FulfillmentService
        const fulfillmentData = await triggerFulfillmentDryRun(orderParams);
        if (!fulfillmentData) {
            logger.info(
                `No fulfillment data found for device ID: ${orderParams.device_id}`,
            );
            return {
                status: OrderStatus.NON_FULFILLABLE,
            } as Order;
        }

        if (
            fulfillmentData.fulfillment_status ===
            fulfillmentStatus.NOT_FULFILLABLE
        ) {
            logger.info(
                `Order is not fulfillable for device ID: ${orderParams.device_id} and quantity: ${orderParams.quantity}`,
            );
            return {
                status: OrderStatus.NON_FULFILLABLE,
            } as Order;
        }

        // Creating a unique order ID so that it can be used for reservation
        if (!orderParams.order_id) {
            orderParams.order_id = uuid();
        }

        const reservationData: StockReserveRequest[] =
            inventoryReservationRequestData(
                orderParams.order_id as string,
                fulfillmentData.fulfillment_plan,
            );

        // this can be done in parallel
        const reservations =
            await inventoryService.reserveStock(reservationData);

        // Processing Order
        const order = await processOrder(orderParams, device, fulfillmentData);
        if (order && order.status === OrderStatus.PENDING) {
            logger.info(
                `Order placed successfully for device ID: ${orderParams.device_id}`,
            );
            // confirm resrvation here
        }

        // Trigger fulfillment for the placed order. This will be done asynchronously
        const _ = fulfillmentService.triggerFulfillment(
            reservations.reservations,
            order.id,
        );

        return order;
    } catch (error) {
        throw error;
    }
};

const processOrder = async (
    orderParams: OrderCreateRequest,
    device: Device,
    fulfillmentData: FulfillmentResponse,
): Promise<Order> => {
    try {
        const discount: Discount = await discountService.getDiscountByOrderItem(
            device.device_id,
            orderParams.quantity,
        );
        if (Object.keys(discount).length === 0) {
            logger.info(
                `No discounts found for device ID: ${orderParams.device_id}`,
            );
        }
        const orderItem: OrderItem = {
            device_id: device.device_id,
            device_name: device.device_name,
            quantity: orderParams.quantity,
            unit_price: device.price,
            unit_weight: device.weight_kg,
            discount: discount ? discount.discount : 0,
            total_item_price: orderParams.quantity * device.price,
        };
        const order: Order = {
            id: orderParams.order_id ?? uuid(),
            items: [orderItem],
            total_price: calculateDiscountedPrice(
                orderParams.quantity * device.price,
                discount ? discount.discount : 0,
            ),
            total_shipping_cost: fulfillmentData.fulfillment_plan.reduce(
                (acc, plan) =>
                    acc +
                    calculateTotalShippingCost(
                        device.weight_kg,
                        plan.quantity_fulfilled,
                        plan.distance,
                    ),
                0,
            ),
            status: OrderStatus.PENDING,
            latitude: orderParams.latitude,
            longitude: orderParams.longitude,
            total_discount: discount ? discount.discount : 0,
        };

        const newOrder = await saveOrderToDatabase(order);
        if (!newOrder) {
            throw new Error('Failed to save order');
        }

        return order;
    } catch (error) {
        throw error;
    }
};

const saveOrderToDatabase = async (order: Order): Promise<Order> => {
    // Assuming you have a database connection and a method to save the order
    const orderRepository = getOrderRepository(dbConnection);
    const savedOrder = await orderRepository.create(order);
    logger.info(`Saving order to database: ${JSON.stringify(order)}`);
    return savedOrder;
};

const triggerFulfillmentDryRun = async (
    order: OrderCreateRequest,
): Promise<FulfillmentDryRunResponse> => {
    const fulfillmentRequest: FulfillmentFilters = {
        device_id: order.device_id,
        quantity_requested: order.quantity,
        order_latitude: order.latitude,
        order_longitude: order.longitude,
    };
    // Perform dry run logic here
    const dryRunResult =
        await fulfillmentService.getFulfillmentDryRun(fulfillmentRequest);
    return dryRunResult;
};

const validateStock = async (
    deviceId: string,
    quantity: number,
): Promise<string> => {
    try {
        const stock = await inventoryService.getStock({
            device_ids: [deviceId],
        });
        if (!stock?.length) {
            throw new Error(`No stock found for device ID: ${deviceId}`);
        }

        const totalStock = stock.reduce((acc, item) => acc + item.stock, 0);
        if (totalStock < quantity) {
            logger.info(
                `Insufficient stock for device ID: ${deviceId}. Available: ${totalStock}, Requested: ${quantity}`,
            );
            return Inventory.StockStatus.OUT_OF_STOCK;
        }

        logger.info(
            `Sufficient stock for device ID: ${deviceId}. Available: ${totalStock}, Requested: ${quantity}`,
        );
        return Inventory.StockStatus.IN_STOCK;
    } catch (error) {
        logger.error(
            `Error validating stock for device ID: ${deviceId}. Error: ${
                (error as Error).message
            }`,
        );
        throw error;
    }
};

export default {
    getOrderReview,
    placeOrder,
};
