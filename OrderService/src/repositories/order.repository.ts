import { Pool } from 'pg';
import { Order, OrderItem } from '../interfaces/order.interface';
import logger from '../utils/logger';

export class OrderRepositoryPostgres {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async create(newOrder: Order): Promise<Order> {
        const { items, ...orderDetails } = newOrder;
        try {
            if (items.length === 0) {
                throw new Error(
                    'OrderService: Order must have at least one item',
                );
            }
            await this.startTransaction();
            const orderResult = await this.db.query(
                `INSERT INTO orders (id, total_price, total_shipping_cost, status, latitude, longitude, total_discount)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [
                    orderDetails.id,
                    orderDetails.total_price,
                    orderDetails.total_shipping_cost,
                    orderDetails.status,
                    orderDetails.latitude,
                    orderDetails.longitude,
                    orderDetails.total_discount,
                ],
            );

            const orderItemsResult = await this.insertOrderItems(
                orderDetails.id,
                items,
            );
            await this.commitTransaction();
            const order = orderResult.rows[0] as Order;
            order.items = orderItemsResult;
            return order;
        } catch (error) {
            await this.rollbackTransaction();
            throw new Error(
                `Failed to create order error ${JSON.stringify(
                    (error as Error).message,
                )}`,
            );
        }
    }

    async insertOrderItems(
        orderId: string,
        items: OrderItem[],
    ): Promise<OrderItem[]> {
        try {
            if (items.length === 0) {
                throw new Error('No items to insert');
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const values: any[] = [];
            const placeholders: string[] = [];
            let placeholderIndex = 1;

            items.forEach((item) => {
                placeholders.push(
                    `(${Array.from(
                        { length: Object.keys(item).length + 1 },
                        () => `$${placeholderIndex++}`,
                    ).join(', ')})`,
                );
                values.push(orderId, ...Object.values(item));
            });

            const sql = `
                INSERT INTO order_items (order_id, device_id, device_name, quantity, unit_price, unit_weight, discount, total_item_price)
                VALUES ${placeholders.join(', ')} RETURNING *`;

            const orderItemsResult = await this.db.query(sql, values);

            if (orderItemsResult.rows.length === 0) {
                throw new Error('Failed to insert order items');
            }

            return orderItemsResult.rows as OrderItem[];
        } catch (error) {
            logger.error(
                'Error inserting order items:',
                (error as Error).message,
            );
            throw new Error(
                `Failed to insert order items: ${(error as Error).message}`,
            );
        }
    }

    async findOrderAndOrderItemsByOrderId(id: string): Promise<Order | null> {
        const result = await this.db.query(
            `SELECT * FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1`,
            [id],
        );
        if (result.rows.length === 0) {
            return null;
        }
        const order = result.rows[0];
        const orderItems = result.rows.map((row) => ({
            id: row.oi_id,
            device_id: row.device_id,
            device_name: row.device_name,
            quantity: row.quantity,
            unit_price: row.unit_price,
            unit_weight: row.unit_weight,
            discount: row.discount,
            total_item_price: row.total_item_price,
        }));
        return {
            ...order,
            items: orderItems,
        };
    }

    async startTransaction() {
        await this.db.query('BEGIN');
    }
    async commitTransaction() {
        await this.db.query('COMMIT');
    }
    async rollbackTransaction() {
        await this.db.query('ROLLBACK');
    }
}
