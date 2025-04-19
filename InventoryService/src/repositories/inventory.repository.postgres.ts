import { Repository } from '../interfaces/repository.interface';
import {
    Inventory,
    InventoryFilters,
    InventoryUpdateFilters,
} from '../interfaces/inventory.interface';
import logger from '../utils/logger';
import { Pool } from 'pg';

export class InventoryRepositoryPostgres implements Repository<Inventory> {
    constructor(private db: Pool) {}

    async startTransaction() {
        await this.db.query('BEGIN');
    }
    async commitTransaction() {
        await this.db.query('COMMIT');
    }
    async rollbackTransaction() {
        await this.db.query('ROLLBACK');
    }

    async get(options?: Partial<InventoryFilters>): Promise<Inventory[]> {
        // Implementation for fetching devices from PostgreSQL
        let query = 'SELECT * FROM inventories';
        const params = [];

        for (const key in options) {
            logger.info('Adding inventory getOption Key: \n', key);
            query += params.length ? ' AND' : ' WHERE';
            if (
                key === 'device_ids' &&
                options &&
                options.device_ids &&
                options.device_ids.length > 0
            ) {
                query += ` device_id = ANY($${params.length + 1})`;
                params.push(options.device_ids);
            }
            if (
                key === 'warehouse_ids' &&
                options &&
                options.warehouse_ids &&
                options.warehouse_ids.length > 0
            ) {
                query += ` warehouse_id = ANY($${params.length + 1})`;
                params.push(options.warehouse_ids);
            }
            if (
                key === 'filter_stockless' &&
                Boolean(options.filter_stockless) === true
            ) {
                query += ' stock > 0';
            }
        }
        try {
            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching inventory from db: ${error}`);
        }
    }

    async add(inventory: Inventory): Promise<Inventory> {
        // Implementation for adding a device to PostgreSQL
        try {
            if (!inventory) {
                logger.error('Inventory object is required');
                throw new Error('Inventory object is required');
            }

            const query =
                'INSERT INTO inventories (warehouse_id, device_id, stock) VALUES ($1, $2, $3) RETURNING *';
            const params = [
                inventory.warehouse_id,
                inventory.device_id,
                inventory.stock,
            ];
            const result = await this.db.query(query, params);
            const newInventory: Inventory = {
                id: result.rows[0].id,
                warehouse_id: result.rows[0].warehouse_id,
                stock: result.rows[0].stock,
                device_id: result.rows[0].device_id,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info('Inventory saved!');

            return newInventory;
        } catch (error) {
            throw new Error(`Error adding inventory to db: ${error}`);
        }
    }

    async update(
        id: string,
        inventoryUpdate: InventoryUpdateFilters,
    ): Promise<Inventory> {
        // Implementation for updating a device in PostgreSQL
        try {
            if (!inventoryUpdate) {
                logger.error('Inventory object is required');
                throw new Error('Inventory object is required');
            }

            let query = 'UPDATE inventories SET';
            const params = [];
            let optionsCount = 1;
            for (const key in inventoryUpdate) {
                if (
                    inventoryUpdate[key as keyof InventoryUpdateFilters] !==
                    undefined
                ) {
                    query +=
                        params.length === 0 ? (query += ' ') : (query += ', ');
                    query += ` ${key} = $${optionsCount}`;
                    params.push(
                        inventoryUpdate[key as keyof InventoryUpdateFilters],
                    );
                    optionsCount++;
                }
            }

            query += ` WHERE id = $${optionsCount} RETURNING *`;
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
            logger.info('Inventory updated!');

            return updatedInventory;
        } catch (error) {
            logger.error('Error updating inventory: ', error);
            throw error;
        }
    }

    // Using Postgres CASE WHEN for multiple updates
    async updateMultiple(inventories: Inventory[]): Promise<Inventory[]> {
        if (inventories.length === 0) {
            return [];
        }

        try {
            const updatedInventories: Inventory[] = [];

            for (const inventory of inventories) {
                const query = `
                UPDATE inventories
                SET stock = $1, updated_at = $2
                WHERE device_id = $3::uuid AND warehouse_id = $4::uuid
                RETURNING *;
            `;

                const params = [
                    inventory.stock, // Stock value
                    new Date().toISOString(), // Updated timestamp
                    inventory.device_id, // Device ID
                    inventory.warehouse_id, // Warehouse ID
                ];

                const result = await this.db.query(query, params);

                if (result.rows.length > 0) {
                    updatedInventories.push(result.rows[0]);
                }
            }

            return updatedInventories;
        } catch (error) {
            logger.error('Error updating reservations:', error);
            throw new Error(
                `Inventory Repository: Error updating inventory in db: ${error}`,
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async insertMultiple(items: Inventory[]): Promise<Inventory[]> {
        return [];
    }
}
