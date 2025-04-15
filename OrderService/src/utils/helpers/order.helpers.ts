import { OrderCreateRequest } from "../../interfaces/order.interface";

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