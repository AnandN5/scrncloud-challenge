
import { Repository } from "../interfaces/database.interface";
import { Device, DeviceFilters } from "../interfaces/device.interface";
import logger from "../utils/logger";

export class DeviceRepositoryPostgres implements Repository {

    constructor(private db: any) { }

    async getDevices(options?: DeviceFilters): Promise<Device[]> {
        // Implementation for fetching devices from PostgreSQL
        let query = "SELECT * FROM devices";
        const params: any[] = [];
        let optionsCount = 1;
        if (options) {
            if (options.device_name) {
                query += ` WHERE device_name = $${optionsCount}`;
                params.push(options.device_name);
                optionsCount++;
            }
            if (options.id) {
                query += params.length ? " AND" : " WHERE";
                query += ` id = $${optionsCount}`;
                params.push(options.id);
                optionsCount++;
            }
        }
        try {
            const result = await this.db.query(query, params);
            return result.rows;
        }
        catch (error) {
            logger.error("Error fetching devices from PostgreSQL", error);
            throw error;
        }
    }

    async addDevice(device: Device): Promise<Device> {
        // Implementation for adding a device to PostgreSQL
        if (!device) {
            logger.error("Device object is required");
            throw new Error("Device object is required");
        }

        const query = "INSERT INTO devices (device_name, price, weight_kg) VALUES ($1, $2, $3) RETURNING *";
        const params = [device.device_name, device.price, device.weight_kg];
        try {
            const result = await this.db.query(query, params);
            const newDevice: Device = {
                id: result.rows[0].id,
                device_name: result.rows[0].device_name,
                price: result.rows[0].price,
                weight_kg: result.rows[0].weight_kg,
                deleted: result.rows[0].deleted,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            };
            logger.info("Device added to PostgreSQL database");

            return newDevice;
        }
        catch (error) {
            logger.error("Error adding device to PostgreSQL database", error);
            throw error;
        }
    }
}