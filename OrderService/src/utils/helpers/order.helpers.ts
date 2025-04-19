import { Device } from "../../interfaces/device.interface";
import { OrderCreateRequest, OrderData } from "../../interfaces/order.interface";
import { MAX_SHIPPING_COST_PERCENTAGE, PRICE_PER_KG_PER_KM } from "../constants";

export const calculateDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
}

export const getShippingCostPercentage = (total_price: number, shipping_cost: number) => {
    return (shipping_cost / total_price) * 100;
}

export const validateOrderRequest = (orderRequest: OrderCreateRequest) => {
    if (!orderRequest.device_id || !orderRequest.quantity) {
        throw new Error("Invalid order request: device_id and quantity are required");
    }
    if (orderRequest.quantity <= 0) {
        throw new Error("Invalid order request: quantity must be greater than 0");
    }
    if (orderRequest.latitude < -90 || orderRequest.latitude > 90) {
        throw new Error("Invalid order request: latitude must be between -90 and 90");
    }
    if (orderRequest.longitude < -180 || orderRequest.longitude > 180) {
        throw new Error("Invalid order request: longitude must be between -180 and 180");
    }
}

export const calculateItemTotals = (item: Device, orderRequest: OrderCreateRequest) => {
    const itemWithTotals = {
        ...item,
        quantity_requested: orderRequest.quantity,
        total_price: orderRequest.quantity * item.price,
    }

    return itemWithTotals
}

export const calculateTotalShippingCost = (device_weight_kg: number, quantity: number, distance: number) => {
    return device_weight_kg * quantity * distance * PRICE_PER_KG_PER_KM;
}

export const shouldProceedWithOrder = (orderData: OrderData) => {
    const shipping_cost_percentage = getShippingCostPercentage(orderData.total_price_after_discount, orderData.total_shipping_cost);
    return shipping_cost_percentage <= MAX_SHIPPING_COST_PERCENTAGE;
}