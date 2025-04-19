import { Pool } from 'pg';
import { db_type } from '../config/config';
import { Order } from '../interfaces/order.interface';
import { OrderRepository } from '../interfaces/repository.interface';
import { OrderRepositoryPostgres } from './order.repository';

export const getOrderRepository = (db: Pool): OrderRepository<Order> => {
    switch (db_type) {
        case 'postgres':
            return new OrderRepositoryPostgres(db);
        // Add other database types here if needed
        default:
            throw new Error(`Unsupported database type: ${db_type}`);
    }
};

export default getOrderRepository;
