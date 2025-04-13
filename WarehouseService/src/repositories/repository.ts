import { db_type } from "../config/config";
import { Repository } from "../interfaces/repository.interface";
import { WarehouseRepositoryPostgres } from "./warehouse.repository.postgres";

let warehouseRepository: Repository

const getRepository = (db: any): Repository => {
    if (db_type === "postgres") {
        warehouseRepository = new WarehouseRepositoryPostgres(db);
    }
    // Add other database types here if needed
    return warehouseRepository;
}

export default getRepository;