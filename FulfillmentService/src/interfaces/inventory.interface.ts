export interface GetStockResponse {
    device_id: string;
    warehouse: Warehouse
    stock: number;
}

export interface Warehouse {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface r {
    device_id: string;
    warehouse: Warehouse
    stock: number;
    distance: number;
}