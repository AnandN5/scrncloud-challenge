import { GetStockResponse } from "../interfaces/inventory.interface";

export type StockWithWarehouseDistance = (GetStockResponse & {
    distance: number;
})