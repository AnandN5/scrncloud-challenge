export interface Device {
    device_id: string;
    device_name: string;
    price: number;
    weight_kg: number;
    deleted: boolean
}

export interface DeviceFilters {
    device_id: string
}

export interface DeviceAsOrderItem {
    quantity_requested: number;
    total_price: number;
    fulfillments: {
        warehouse: {
            warehouse_id: string;
            warehouse_name: string;
        };
        item_shipping_cost: number;
        quantity_fulfilled: number;


        total_weight: number;
    }[];
}

export type DeviceWithFulfillment = Device & DeviceAsOrderItem;