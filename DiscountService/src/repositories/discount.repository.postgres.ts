
import { Repository } from "../interfaces/repository.interface";
import { Discount, DiscountFilters } from "../interfaces/discount.interface";
import logger from "../utils/logger";

export class DiscountRepositoryPostgres implements Repository {

    constructor(private db: any) { }

    async getDiscounts(options?: Partial<DiscountFilters>): Promise<Discount[]> {
        // Implementation for fetching devices from PostgreSQL
        let query = "SELECT * FROM discounts";
        const params: any[] = [];
        let optionsCount = 1;

        for (const key in options) {
            logger.info("Adding discount getOption Key: \n", key);
            query += params.length ? " AND" : " WHERE";
            query += ` ${key} = $${optionsCount}`;
            params.push(options[key as keyof DiscountFilters]);
            optionsCount++;
        }
        try {
            const result = await this.db.query(query, params);
            return result.rows;
        }
        catch (error) {
            throw new Error("Error fetching discounts from db");
        }
    }

    async addDiscount(discount: Discount): Promise<Discount> {
        // Implementation for adding a device to PostgreSQL
        try {
            if (!discount) {
                throw new Error("Discount object is required");
            }

            const query = "INSERT INTO discounts (device_id, volume, discount) VALUES ($1, $2, $3) RETURNING *";
            const params = [discount.device_id, discount.volume, discount.discount];
            const result = await this.db.query(query, params);
            const newDiscount: Discount = {
                id: result.rows[0].id,
                device_id: result.rows[0].device_id,
                volume: result.rows[0].volume,
                discount: result.rows[0].discount,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info("Discount saved!");

            return newDiscount;
        }
        catch (error) {
            throw new Error("Error adding discount");
        }
    }

    async getDeviceDiscount(device_id: string, volume: number): Promise<Discount> {
        // Implementation for fetching a device from PostgreSQL
        try {
            const query = "SELECT id, device_id, volume, discount FROM discounts WHERE device_id = $1 AND volume <= $2 ORDER BY volume DESC LIMIT 1";
            const params = [device_id, volume];
            const result = await this.db.query(query, params);
            if (result.rows.length === 0) {
                return {} as Discount;
            }
            const discount: Discount = {
                id: result.rows[0].id,
                device_id: result.rows[0].device_id,
                volume: result.rows[0].volume,
                discount: result.rows[0].discount,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            return discount;
        }
        catch (error) {
            throw new Error("Error fetching device discount from db");
        }
    }
}