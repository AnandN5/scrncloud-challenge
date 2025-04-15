import { FulfillmentRepository } from "../interfaces/repository.interface";

export class FulfillmentRepositoryPostgres implements FulfillmentRepository {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async getFulfillmentDetails(orderId: string): Promise<any> {
        try {
            const result = await this.db.query('SELECT * FROM fulfillments WHERE order_id = $1', [orderId]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error fetching fulfillment details: ${error}`);
        }
    }

    async updateFulfillmentStatus(orderId: string, status: string): Promise<void> {
        try {
            await this.db.query('UPDATE fulfillments SET status = $1 WHERE order_id = $2', [status, orderId]);
        } catch (error) {
            throw new Error(`Error updating fulfillment status: ${error}`);
        }
    }
}
