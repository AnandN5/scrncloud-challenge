import { db_type } from "../config/config";
import { FulfillmentRepository } from "../interfaces/repository.interface";
import { FulfillmentRepositoryPostgres } from "./fulfillment.repository";

let fulfillmentRepository: FulfillmentRepository

const getFulfillmentRepository = (db: any): FulfillmentRepository => {
    if (db_type === "postgres") {
        fulfillmentRepository = new FulfillmentRepositoryPostgres(db);
    }
    // Add other database types here if needed
    return fulfillmentRepository;
}

export default getFulfillmentRepository;