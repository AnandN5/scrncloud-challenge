import { FulfillmentStatus } from "../interfaces/fulfillment.interface";

export const fulfillmentStatus: { [key: string]: FulfillmentStatus } = {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
    NOT_FULFILLABLE: "NOT_FULFILLABLE",
    FULFILLABLE: "FULFILLABLE"
};

export const MAX_SHIPPING_COST_PERCENTAGE = 15

export const PRICE_PER_KG_PER_KM = 0.01

export const OrderStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    COMPLETED: "COMPLETED",
    NON_FULFILLABLE: "NON_FULFILLABLE",
    CANCELLED: "CANCELLED"
}

export const ServiceDiscovery = {
    DEVICE_SERVICE: process.env.DEVICE_SERVICE_URL || "http://localhost:3000/devices",
    DISCOUNT_SERVICE: process.env.DISCOUNT_SERVICE_URL || "http://localhost:3005/discounts",
    FULFILLMENT_SERVICE: process.env.FULFILLMENT_SERVICE_URL || "http://localhost:3008/fulfillments",
}