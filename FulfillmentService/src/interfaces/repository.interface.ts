export interface FulfillmentRepository {
    getFulfillmentDetails(orderId: string): Promise<any>;
    updateFulfillmentStatus(orderId: string, status: string): Promise<void>;
}
