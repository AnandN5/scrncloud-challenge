import { db_type } from "../config/config";
import { Repository } from "../interfaces/database.interface";
import { DeviceRepositoryPostgres } from "./device.repository.postgres";

let deviceRepository: Repository

const getRepository = (db: any): Repository => {
    if (db_type === "postgres") {
        deviceRepository = new DeviceRepositoryPostgres(db);
    }
    // Add other database types here if needed
    return deviceRepository;
}

export default getRepository;