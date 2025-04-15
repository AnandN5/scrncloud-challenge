import { BaseAttributes } from "./base.interface";

type FulfillmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NOT_FULFILLABLE" | "FULFILLABLE"

export interface Fulfillment extends BaseAttributes {
    order_id: string;
    fullfillment_status: FulfillmentStatus;
    total_shipping_cost: number;
    summary?: FulfillmentItems[]
}

export interface FulfillmentItems extends BaseAttributes {
    fulfillment_id: string;
    warehouse_id: string;
    device_id: string;
    distance: number;
    shipping_cost: number;
    quantity_requested: number;
    quantity_fulfilled: number;
}

export interface FulfillmentDryRunFilters {
    device_id: string;
    quantity_requested: number;
    order_latitude: number;
    order_longitude: number;
}

export interface FulfillmentFilters {
    order_id?: string;
    fullfillment_status?: FulfillmentStatus;
    device_ids?: string[];
}


export interface FulfillmentRequest {
    order_id: string;
    items: {
        device_id: string;
        quantity: number;
        price: number;
    }[];
    order_latitude: number;
    order_longitude: number;
}

export interface FulfillmentDryRunResponse {
    fulfillment_status: FulfillmentStatus;
    fulfillment_plan: FulfillmentPlan[]
}

export interface FulfillmentPlan {
    warehouse_id: string;
    warehouse_name: string;
    shipping_cost: number;
    device_id: string;
    quantity_requested: number;
    quantity_fulfilled: number;
}
