export interface Repository<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(options?: any): Promise<T[]>;
    add(inventoryItem: T): Promise<T>;
    update(id: string, inventoryUpdate: Partial<T>): Promise<T>;
    insertMultiple(items: T[]): Promise<T[]>;
    updateMultiple(items: T[]): Promise<T[]>;
}
