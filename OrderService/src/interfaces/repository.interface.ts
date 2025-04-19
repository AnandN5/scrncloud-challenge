export interface OrderRepository<T> {
    create(item: T): Promise<T>;
}
