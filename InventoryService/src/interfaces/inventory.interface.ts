import { BaseAttributes } from "./base.interface";

export interface Inventory extends BaseAttributes {
  device_id: string;
  warehouse_id: string;
  stock: number;
}

export interface InventoryFilters extends GetStockFilters {
  device_id?: string;
  warehouse_id?: string;
  id?: string;
  stock?: number;
}

export interface GetStockFilters {
  device_ids?: string[];
  warehouse_ids?: string[];
  filter_stockless?: boolean;
}

export interface InventoryStockFilters {
  device_ids?: string[];
  warehouse_id?: string[];
}

export interface InventoryUpdateFilters {
  stock: number;
}