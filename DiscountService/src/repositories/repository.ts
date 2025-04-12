import { db_type } from "../config/config";
import { Repository } from "../interfaces/repository.interface";
import { DiscountRepositoryPostgres } from "./discount.repository.postgres";

let inventoryRepository: Repository

const getRepository = (db: any): Repository => {
    if (db_type === "postgres") {
        inventoryRepository = new DiscountRepositoryPostgres(db);
    }
    // Add other database types here if needed
    return inventoryRepository;
}

export default getRepository;