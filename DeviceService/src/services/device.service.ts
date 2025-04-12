import { Device } from "../interfaces/device.interface";
import dbConnection from "../config/postgresdb";
import { DeviceRepositoryPostgres } from "../repositories/device.repository.postgres";
import logger from "../utils/logger";
import getRepository from "../repositories/repository";

const addDevice = async (device: Device): Promise<Device> => {
    // Implementation for adding a device to PostgreSQL
    if (!device) {
        throw new Error("Device data is required");
    }

    const deviceRepository = getRepository(dbConnection);

    try {
        const newDevice = await deviceRepository.addDevice(device);
        return newDevice;
    }
    catch (error) {
        console.error("Error adding device to PostgreSQL database", error);
        logger.error("Error adding device to PostgreSQL database", error);
        throw error;
    }
}

const getDevices = async (options?: any): Promise<Device[]> => {
    const deviceRepository = getRepository(dbConnection);
    try {
        const devices = await deviceRepository.getDevices(options);
        return devices;
    }
    catch (error) {
        console.error("Error fetching devices from PostgreSQL database", error);
        logger.error("Error fetching devices from PostgreSQL database", error);
        throw error;
    }
}

export default {
    addDevice,
    getDevices
}