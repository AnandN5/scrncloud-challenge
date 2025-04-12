import { Inventory, InventoryFilters } from "./inventory.interface";

export interface Repository {
    getInventory(options?: InventoryFilters): Promise<Inventory[]>;
    addInventory(inventoryItem: Inventory): Promise<Inventory>;
    updateInventory(id:string, inventoryUpdate: Partial<Inventory>): Promise<Inventory>;
  }