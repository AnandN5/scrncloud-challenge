export type FulfillmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NOT_FULFILLABLE" | "FULFILLABLE"

export interface FulfillmentDryRunResponse {
    fulfillment_status: FulfillmentStatus;
    fulfillment_plan: FulfillmentPlan[]
}

export interface FulfillmentPlan {
    warehouse_id: string;
    warehouse_name: string;
    distance : number;
    device_id: string;
    quantity_requested: number;
    quantity_fulfilled: number;
}


export interface FulfillmentFilters {
    device_id: string;
    quantity_requested: number;
    order_latitude: number;
    order_longitude: number;
}