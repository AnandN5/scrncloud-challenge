import { BaseAttributes } from "./base.interface";

export interface Discount extends BaseAttributes {
  device_id: string;
  volume: number;
  discount: number;
}

export interface DiscountFilters {
  device_id?: string;
  id?: string;
  volume?: number;
}
