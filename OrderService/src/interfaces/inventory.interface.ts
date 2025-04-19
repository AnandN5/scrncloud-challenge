export interface GetStockResponse {
    device_id: string;
    warehouse_id: string;
    stock: number;
}

export interface StockReserveRequest {
    device_id: string;
    quantity: number;
    warehouse_id: string;
    warehouse_priority: number;
    order_id: string;
}

export interface InventoryReservationSummary {
    status: string;
    message: string;
    reservations: InventoryReservationItem[];
}

export interface InventoryReservationItem {
    device_id: string;
    quantity: number;
    warehouse_id: string | null;
    inventory_id?: string;
    order_id: string;
    status: string;
    reservation_id?: string;
}
