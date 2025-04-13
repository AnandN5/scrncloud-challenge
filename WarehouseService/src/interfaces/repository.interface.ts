import { Warehouse } from "./warehouse.interface";

export interface Repository {
    getWarehouses(): Promise<Warehouse[]>;
    getWarehouseByIds(ids: string[]): Promise<Warehouse[]>;
    addWarehouse(inventoryItem: Warehouse): Promise<Warehouse>;
  }