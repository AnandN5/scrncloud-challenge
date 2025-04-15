import { Device, DeviceWithFulfillment } from "../interfaces/device.interface";
import { Discount } from "../interfaces/discount.interface";
import { FulfillmentFilters } from "../interfaces/fulfillment.interface";
import { FulfillmentResponse, OrderCreateRequest, OrderData } from "../interfaces/order.interface";
import { fulfillmentStatus, MAX_SHIPPING_COST_PERCENTAGE, OrderStatus, PRICE_PER_KG_PER_KM } from "../utils/constants";
import { calculateDiscountedPrice, getShippingCostPercentage } from "../utils/helpers/order.helpers";
import logger from "../utils/logger";
import deviceService from "./device.service";
import discountService from "./discount.service";
import fulfillmentService from "./fulfillment.service";

const getOrderReview = async (order: OrderCreateRequest): Promise<OrderData> => {
    try {
        const device = await deviceService.getDeviceById(order.device_id) as Device;

        if (!device) {
            throw new Error(`No device found for the given ID: ${JSON.stringify(order.device_id)}`);
        }

        const fulfillmentRequest: FulfillmentFilters = {
            device_id: order.device_id,
            quantity_requested: order.quantity,
            order_latitude: order.latitude,
            order_longitude: order.longitude
        }
        // Perform dry run logic here
        const dryRunResult = await fulfillmentService.getFulfillmentDryRun(fulfillmentRequest);
        if (!dryRunResult) {
            throw new Error("No fulfillment data found");
        }

        // Early return if the order is not fulfillable
        if (dryRunResult.fulfillment_status === fulfillmentStatus.NOT_FULFILLABLE) {
            logger.info(`Order is not fulfillable for device ID: ${order.device_id} and quantity: ${order.quantity}`);
            return {
                status: OrderStatus.NON_FULFILLABLE,
            } as any
        }

        // Fetching discounts from DiscountService
        let discount: Discount = await discountService.getDiscountByOrderItem(order.device_id, order.quantity);
        if (Object.keys(discount).length === 0) {
            logger.info(`No discounts found for device ID: ${order.device_id}`);
            discount = undefined as any;
        }

        const orderData = structureOrderData(order, dryRunResult, device, discount);
        if (shouldProceedWithOrder(orderData)) {
            logger.info(`Shipping cost percentage is within the limit: ${MAX_SHIPPING_COST_PERCENTAGE}`);
            orderData.status = OrderStatus.APPROVED;
        } else {
            logger.info(`Shipping cost percentage exceeds the limit: ${MAX_SHIPPING_COST_PERCENTAGE}`);
            orderData.status = OrderStatus.REJECTED;
        }

        return orderData

    } catch (error) {
        throw error
    }
}

const structureOrderData = (orderRequest: OrderCreateRequest, fulfillment: FulfillmentResponse, item: Device, discount: Discount): OrderData => {
    const itemWithTotalPrice = calculateItemTotals(item, orderRequest);
    const itemWithFulfillments = getItemWithFulfillments(fulfillment, itemWithTotalPrice);
    const orderData = {
        item: itemWithFulfillments,
        status: OrderStatus.PENDING,
        total_shipping_cost: itemWithFulfillments.fulfillments.reduce((acc, fulfillment) => acc + fulfillment.item_shipping_cost, 0),
        total_price_after_discount: calculateDiscountedPrice(itemWithFulfillments.total_price, discount ? discount.discount : 0),
    }
    return orderData;
}

const shouldProceedWithOrder = (orderData: OrderData) => {
    const shipping_cost_percentage = getShippingCostPercentage(orderData.total_price_after_discount, orderData.total_shipping_cost);
    return shipping_cost_percentage <= MAX_SHIPPING_COST_PERCENTAGE;
}

const calculateItemTotals = (item: Device, orderRequest: OrderCreateRequest) => {
    let itemWithTotals = {
        ...item,
        quantity_requested: orderRequest.quantity,
        total_price: orderRequest.quantity * item.price,
    }

    return itemWithTotals
}

const getItemWithFulfillments = (fulfillment: FulfillmentResponse, item: Device & { quantity_requested: number; total_price: number; }): DeviceWithFulfillment => {
    const itemFulfillments = fulfillment.fulfillment_plan.filter((plan) => plan.device_id === item.device_id);
    const fulfillmentData: {
        warehouse: {
            warehouse_id: string;
            warehouse_name: string;
        };
        item_shipping_cost: number;
        quantity_fulfilled: number;
        total_weight: number;
    }[] = [];
    itemFulfillments.forEach((itemFulfillment) => {
        const item_shipping_cost = calculateTotalShippingCost(item.weight_kg, itemFulfillment.quantity_fulfilled, itemFulfillment.distance);
        const fulfillments = {
            warehouse: {
                warehouse_id: itemFulfillment.warehouse_id,
                warehouse_name: itemFulfillment.warehouse_name
            },
            item_shipping_cost,
            quantity_fulfilled: itemFulfillment.quantity_fulfilled,
            total_weight: itemFulfillment.quantity_fulfilled * item.weight_kg,
        }
        fulfillmentData.push(fulfillments);
    })
    return { ...item, fulfillments: fulfillmentData };
}

const calculateTotalShippingCost = (device_weight_kg: number, quantity: number, distance: number) => {
    return device_weight_kg * quantity * distance * PRICE_PER_KG_PER_KM;
}


export default {
    getOrderReview
};