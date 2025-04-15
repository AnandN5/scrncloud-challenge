import { Order } from "../interfaces/order.interface";

export class OrderRepositoryPostgres {
    private db: any;

    constructor(db: any) {
        this.db = db;
    }

    async create(order: Order): Promise<any> {
        const result = await this.db('orders').insert(order.items).returning('*');
        return result[0];
    }

    async findById(id: string): Promise<any | null> {
        const result = await this.db('orders').where({ id }).first();
        return result || null;
    }

    async findAll(): Promise<any[]> {
        const result = await this.db('orders').select('*');
        return result;
    }

    async update(id: string, item: Partial<any>): Promise<any | null> {
        const result = await this.db('orders').where({ id }).update(item).returning('*');
        return result[0] || null;
    }
}