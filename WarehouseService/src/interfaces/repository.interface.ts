import { Warehouse, WarehouseFilters } from "./warehouse.interface";

export interface Repository {
    getWarehouses(options?: WarehouseFilters): Promise<Warehouse[]>;
    getWarehouseByIds(ids: string[]): Promise<Warehouse[]>;
    addWarehouse(inventoryItem: Warehouse): Promise<Warehouse>;
  }