import { Discount, DiscountFilters } from "./discount.interface";

export interface Repository {
    getDiscounts(options?: DiscountFilters): Promise<Discount[]>;
    addDiscount(inventoryItem: Discount): Promise<Discount>;
    getDeviceDiscount(device_id: string, volume: number): Promise<Discount>;
  }