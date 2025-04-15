
import { Repository } from "../interfaces/repository.interface";
import { Inventory, InventoryFilters, InventoryUpdateFilters } from "../interfaces/inventory.interface";
import logger from "../utils/logger";

export class InventoryRepositoryPostgres implements Repository {

    constructor(private db: any) { }

    async getInventory(options?: Partial<InventoryFilters>): Promise<Inventory[]> {
        // Implementation for fetching devices from PostgreSQL
        let query = "SELECT * FROM inventories";
        const params: any[] = [];
        let optionsCount = 1;

        for (const key in options) {
            logger.info("Adding inventory getOption Key: \n", key);
            query += params.length ? " AND" : " WHERE";
            if (key === "device_ids" && options && options.device_ids && options.device_ids.length > 0) {
                query += " device_id = ANY($1)";
                params.push(options.device_ids);
            } 
            if(key === "filter_stockless" && Boolean(options.filter_stockless) === true) {
                query += " stock > 0";
            }
            optionsCount++;
        }
        try {
            const result = await this.db.query(query, params);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Error fetching inventory from db: ${error}`);
        }
    }

    async addInventory(inventory: Inventory): Promise<Inventory> {
        // Implementation for adding a device to PostgreSQL
        try {
            if (!inventory) {
                logger.error("Inventory object is required");
                throw new Error("Inventory object is required");
            }

            const query = "INSERT INTO inventories (warehouse_id, device_id, stock) VALUES ($1, $2, $3) RETURNING *";
            const params = [inventory.warehouse_id, inventory.device_id, inventory.stock];
            const result = await this.db.query(query, params);
            const newInventory: Inventory = {
                id: result.rows[0].id,
                warehouse_id: result.rows[0].warehouse_id,
                stock: result.rows[0].stock,
                device_id: result.rows[0].device_id,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info("Inventory saved!");

            return newInventory;
        }
        catch (error) {
            throw new Error(`Error adding inventory to db: ${error}`);
        }
    }

    async updateInventory(id: string, inventoryUpdate: InventoryUpdateFilters): Promise<Inventory> {
        // Implementation for updating a device in PostgreSQL
        try {
            if (!inventoryUpdate) {
                logger.error("Inventory object is required");
                throw new Error("Inventory object is required");
            }

            let query = "UPDATE inventories SET";
            const params: any[] = [];
            let optionsCount = 1;
            for (const key in inventoryUpdate) {
                if (inventoryUpdate[key as keyof InventoryUpdateFilters] !== undefined) {
                    params.length === 0 ? query += " " : query += ", ";
                    query += ` ${key} = $${optionsCount}`;
                    params.push(inventoryUpdate[key as keyof InventoryUpdateFilters]);
                    optionsCount++;
                }
            }

            query += ` WHERE id = $${optionsCount} RETURNING *`
            params.push(id);
            const result = await this.db.query(query, params);
            const updatedInventory: Inventory = {
                id: result.rows[0].id,
                warehouse_id: result.rows[0].warehouse_id,
                stock: result.rows[0].stock,
                device_id: result.rows[0].device_id,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info("Inventory updated!");

            return updatedInventory;
        }
        catch (error) {
            logger.error("Error updating inventory: ", error);
            throw error;
        }
    }
}