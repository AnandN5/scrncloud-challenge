import { BaseAttributes } from './base.interface'; 

export interface Device extends BaseAttributes {
  device_name: string;
  price: number;
  weight_kg: number;
  deleted: boolean;
}

export interface DeviceFilters {
  device_name?: string;
  id?: string;
}

