export interface OrderRepository<T> {
    create(item: T): Promise<T>;
    // findById(id: string): Promise<T | null>;
    // findAll(): Promise<T[]>;
    // update(id: string, item: Partial<T>): Promise<T | null>;
}

export interface FulfillmentRepository {
    getFulfillmentDetails(orderId: string): Promise<any>;
    updateFulfillmentStatus(orderId: string, status: string): Promise<void>;
}
