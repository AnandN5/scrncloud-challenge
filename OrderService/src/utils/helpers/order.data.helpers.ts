import { Device, DeviceWithFulfillment } from "../../interfaces/device.interface";
import { Discount } from "../../interfaces/discount.interface";
import { FulfillmentResponse, OrderCreateRequest, OrderData } from "../../interfaces/order.interface";
import { OrderStatus } from "../constants";
import { calculateDiscountedPrice, calculateItemTotals, calculateTotalShippingCost } from "./order.helpers";

const mapOrderItemWithFulfillments = (fulfillment: FulfillmentResponse, item: Device & { quantity_requested: number; total_price: number; }): DeviceWithFulfillment => {
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

export const structureOrderData = (orderRequest: OrderCreateRequest, fulfillment: FulfillmentResponse, item: Device, discount: Discount): OrderData => {
    const itemWithTotalPrice = calculateItemTotals(item, orderRequest);
    const itemWithFulfillments = mapOrderItemWithFulfillments(fulfillment, itemWithTotalPrice);
    const orderData = {
        item: itemWithFulfillments,
        status: OrderStatus.PENDING,
        total_shipping_cost: itemWithFulfillments.fulfillments.reduce((acc, fulfillment) => acc + fulfillment.item_shipping_cost, 0),
        total_price_after_discount: calculateDiscountedPrice(itemWithFulfillments.total_price, discount ? discount.discount : 0),
    }
    return orderData;
}