import {
    GetStockFilters,
    Inventory,
    InventoryFilters,
    InventoryUpdateFilters,
} from '../interfaces/inventory.interface';
import dbConnection from '../config/postgresdb';
import logger from '../utils/logger';
import getRepository from '../repositories/repository';
import {
    InventoryReservationSummary,
    StockReserveRequest,
} from '../interfaces/inventory.reservation.interface';
import {
    reduceReservedQtyFromStock,
    reservationItems,
} from '../utils/helpers/reservation.helpers';
import { ReservationStatus } from '../utils/constants';
import { InventoryRepositoryPostgres } from '../repositories/inventory.repository.postgres';
import { processReservation } from '../repositories/inventory.reservation.repository';

const addInventory = async (inventory: Inventory): Promise<Inventory> => {
    try {
        // Implementation for adding a inventory to PostgreSQL
        if (!inventory) {
            throw new Error('Inventory data is required');
        }

        const inventoryRepository = getRepository<Inventory>(
            dbConnection,
            InventoryRepositoryPostgres,
        );

        const newInventory = await inventoryRepository.add(inventory);
        return newInventory;
    } catch (error) {
        console.error('Error adding inventory to db', error);
        logger.error('Error adding inventory to db', error);
        throw error;
    }
};

const getInventories = async (
    options?: InventoryFilters,
): Promise<Inventory[]> => {
    const inventoryRepository = getRepository<Inventory>(
        dbConnection,
        InventoryRepositoryPostgres,
    );
    try {
        const inventory = await inventoryRepository.get(options);
        return inventory;
    } catch (error) {
        console.error('Error fetching inventory from db', error);
        logger.error('Error fetching inventory from db', error);
        throw error;
    }
};

const updateInventory = async (
    id: string,
    inventoryUpdate: InventoryUpdateFilters,
): Promise<Inventory> => {
    const inventoryRepository = getRepository<Inventory>(
        dbConnection,
        InventoryRepositoryPostgres,
    );
    try {
        const inventoryItem = await inventoryRepository.get({ id });
        if (!inventoryItem || inventoryItem.length === 0) {
            logger.error(`Inventory with id ${id} not found for updation`);
            throw new Error(`Inventory with id ${id} not found`);
        }
        if (!inventoryUpdate) {
            logger.error('Inventory update data is required for updation');
            throw new Error('Inventory update data is required');
        }
        // Ensure the ID is included in the update
        const updatedInventory = await inventoryRepository.update(
            id,
            inventoryUpdate,
        );
        return updatedInventory;
    } catch (error) {
        console.error('Error updating inventory in db', error);
        logger.error('Error updating inventory in db', error);
        throw error;
    }
};

const getStock = async (filters: GetStockFilters): Promise<Inventory[]> => {
    const inventoryRepository = getRepository<Inventory>(
        dbConnection,
        InventoryRepositoryPostgres,
    );
    const stocks = await inventoryRepository.get(filters);

    if (!stocks || stocks.length === 0) {
        logger.info('No stock found for the given filters', filters);
        return [];
    }

    return stocks;
};

const reserveStock = async (
    params: StockReserveRequest[],
): Promise<InventoryReservationSummary> => {
    const inventoryRepository = getRepository<Inventory>(
        dbConnection,
        InventoryRepositoryPostgres,
    );
    try {
        const device_ids = params.map((item) => item.device_id);
        const warehouse_ids = params.map((item) => item.warehouse_id);
        const reservationSummary = {} as InventoryReservationSummary;

        const stocks = await inventoryRepository.get({
            device_ids,
            warehouse_ids,
            filter_stockless: true,
        });
        if (!stocks || stocks.length === 0) {
            logger.error(
                `Stock not found for devices ${device_ids} in warehouse ${warehouse_ids}`,
            );
            reservationSummary.status = ReservationStatus.RESERVE_FAILED;
            reservationSummary.message = `Stock not found for devices ${device_ids} in warehouse ${warehouse_ids}`;
            reservationSummary.reservations = [];
            return reservationSummary;
        }

        const totalStock = stocks.reduce((acc, stock) => acc + stock.stock, 0);
        const quantity_requested = params.reduce(
            (acc, request) => acc + request.quantity,
            0,
        );
        if (totalStock < quantity_requested) {
            reservationSummary.status = ReservationStatus.RESERVE_FAILED;
            reservationSummary.message = `Insufficient stock: total stock - ${totalStock} for devices ${device_ids} in warehouse ${warehouse_ids} not enough for requested quantity - ${quantity_requested}`;
            reservationSummary.reservations = [];
            return reservationSummary;
        }

        // creating stocks with reduced stock
        const stocksWithReservesReduced = reduceReservedQtyFromStock(
            params,
            stocks,
        );

        const reservationStocks = reservationItems(params, stocks);
        const reservations = await processReservation(
            stocksWithReservesReduced,
            reservationStocks,
        );

        return reservations;
    } catch (error) {
        logger.error('Error reserving stock', error);
        throw error;
    }
};

export default {
    addInventory,
    getInventories,
    updateInventory,
    getStock,
    reserveStock,
};
