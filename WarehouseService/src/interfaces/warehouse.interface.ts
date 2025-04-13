import { BaseAttributes } from "./base.interface";

export interface Warehouse extends BaseAttributes {
  name: string;
  latitude: number;
  longitude: number;
}

export interface PotentialWarehouseResponse {
  warehouse: Warehouse;
  distance: number;
}