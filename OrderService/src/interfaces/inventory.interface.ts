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
