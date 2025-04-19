import { Warehouse } from "./warehouse.interface";

export interface GetStockResponse {
    device_id: string;
    warehouse_id: string
    stock: number;
}
export interface StockWithWarehouseDistance {
    device_id: string;
    warehouse: Warehouse
    stock: number;
    distance: number;
}