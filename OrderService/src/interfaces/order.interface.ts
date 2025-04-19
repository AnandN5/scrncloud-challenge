import { BaseAttributes } from "./base.interface";
import { DeviceWithFulfillment } from "./device.interface";
import { FulfillmentDryRunResponse } from "./fulfillment.interface";

export interface Order extends BaseAttributes {
  // user_id: string;
  latitude: number;
  longitude: number;
  status: string;
  total_price: number;
  items: OrderItem[];
  total_shipping_cost?: number;
  total_discount?: number;
}

export interface OrderItem {
  device_id: string;
  device_name: string;
  quantity: number;
  unit_price: number;
  unit_weight: number;
  order_id?: string;
  discount?: number;
  total_item_price?: number;
  shipping_status?: string;
}

export interface OrderCreateRequest {
  latitude: number;
  longitude: number;
  device_id: string;
  quantity: number;
  dry_run?: boolean;
  order_id?: string;
}

export interface OrderData {
  item: DeviceWithFulfillment;
  status: string;
  total_shipping_cost: number;
  total_price_after_discount: number;
}

export type FulfillmentResponse = FulfillmentDryRunResponse;
