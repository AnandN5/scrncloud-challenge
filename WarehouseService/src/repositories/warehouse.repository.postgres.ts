
import { Repository } from "../interfaces/repository.interface";
import { Warehouse } from "../interfaces/warehouse.interface";
import logger from "../utils/logger";

export class WarehouseRepositoryPostgres implements Repository {

    constructor(private db: any) { }

    async getWarehouses(): Promise<Warehouse[]> {
        // Implementation for getting all warehouses from PostgreSQL
        try {
            const query = "SELECT id, name, latitude, longitude FROM warehouses";
            const result = await this.db.query(query);
            return result.rows;
        }
        catch (error) {
            throw new Error("Error fetching warehouses");
        }
    }

    async getWarehouseByIds(ids: string[]): Promise<Warehouse[]> {
        try {
            if (!ids || ids.length === 0) {
                throw new Error("IDs array is required");
            }
            const query = "SELECT id, name, latitude, longitude FROM warehouses WHERE id = ANY($1)";
            const params = [ids];
            const result = await this.db.query(query, params);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Error fetching warehouses by IDs, ${JSON.stringify(error, null, 2)}`);
        }
    }

    async addWarehouse(warehouse: Warehouse): Promise<Warehouse> {
        // Implementation for adding a device to PostgreSQL
        try {
            if (!warehouse) {
                throw new Error("Warehouse object is required");
            }

            const query = "INSERT INTO warehouses (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING *";
            const params = [warehouse.name, warehouse.latitude, warehouse.longitude];
            const result = await this.db.query(query, params);
            const newWarehouse: Warehouse = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                latitude: result.rows[0].latitude,
                longitude: result.rows[0].longitude,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info("Warehouse saved!");

            return newWarehouse;
        }
        catch (error) {
            throw new Error("Error adding warehouse");
        }
    }
}