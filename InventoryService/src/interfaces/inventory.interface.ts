import { BaseAttributes } from "./base.interface";

export interface Inventory extends BaseAttributes {
  device_id: string;
  warehouse_id: string;
  stock: number;
}

export interface InventoryFilters {
  device_id?: string;
  warehouse_id?: string;
  id?: string;
  stock?: number;
}

export interface InventoryUpdateFilters {
  stock: number;
}