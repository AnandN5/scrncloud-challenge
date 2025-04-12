import dbConnection from "../config/postgresdb";
import { Discount, DiscountFilters } from "../interfaces/discount.interface";
import getRepository from "../repositories/repository";
import logger from "../utils/logger";

const getDiscounts = async (options?: Partial<DiscountFilters>): Promise<Discount[]> => {
    const discountRepository = getRepository(dbConnection);
    try {
        const discounts = await discountRepository.getDiscounts(options);
        return discounts;
    }
    catch (error) {
        logger.error("Error fetching discounts from db", error);
        throw error;
    }   
}

const addDiscount = async (discount: Discount): Promise<Discount> => {
    try {
        // Implementation for adding a discount to PostgreSQL
        if (!discount) {
            logger.error("Discount data is required");
            throw new Error("Discount data is required");
        }
        const discountRepository = getRepository(dbConnection);
        const newDiscount = await discountRepository.addDiscount(discount);
        return newDiscount;
    }
    catch (error) {
        logger.error("Error adding discount to db", error);
        throw error;
    }
}

const getDeviceDiscount = async (device_id: string, volume: number): Promise<Discount> => {
    const discountRepository = getRepository(dbConnection);
    try {
        const discount = await discountRepository.getDeviceDiscount(device_id, volume);
        return discount;
    }
    catch (error) {
        throw error;
    }
}

export default {
    getDiscounts,
    addDiscount,
    getDeviceDiscount,
}