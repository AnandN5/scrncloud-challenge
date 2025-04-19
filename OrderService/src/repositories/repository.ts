import { Pool } from 'pg';
import { db_type } from '../config/config';
import { Order } from '../interfaces/order.interface';
import { OrderRepository } from '../interfaces/repository.interface';
import { OrderRepositoryPostgres } from './order.repository';

let orderRepository: OrderRepository<Order>;

const getOrderRepository = (db: Pool): OrderRepository<Order> => {
    if (db_type === 'postgres') {
        orderRepository = new OrderRepositoryPostgres(db);
    }
    // Add other database types here if needed
    return orderRepository;
};

export default getOrderRepository;
