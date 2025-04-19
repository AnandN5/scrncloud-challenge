import { Pool } from 'pg';
import {
    InventoryReservationFilters,
    InventoryReservationItem,
    InventoryReservationSummary,
} from '../interfaces/inventory.reservation.interface';
import { Repository } from '../interfaces/repository.interface';
import { Inventory } from '../interfaces/inventory.interface';
import getRepository from './repository';
import dbConnection from '../config/postgresdb';
import { InventoryRepositoryPostgres } from './inventory.repository.postgres';
import logger from '../utils/logger';
import { ReservationStatus } from '../utils/constants';

export class InventoryReservationRepository
    implements Repository<InventoryReservationItem>
{
    private db: Pool;

    constructor(pool: Pool) {
        this.db = pool;
    }

    async startTransaction() {
        await this.db.query('BEGIN');
    }
    async commitTransaction() {
        await this.db.query('COMMIT');
    }
    async rollbackTransaction() {
        await this.db.query('ROLLBACK');
    }

    async get(
        options?: Partial<InventoryReservationFilters>,
    ): Promise<InventoryReservationItem[]> {
        let query = 'SELECT * FROM inventory_reservations';
        const params = [];
        if (options) {
            const conditions = [];
            if (options.reservation_ids) {
                conditions.push(`reservation_id = ANY($${params.length + 1})`);
                params.push(options.reservation_ids);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
        }
        try {
            const result = await this.db.query(query, params);
            return result.rows as InventoryReservationItem[];
        } catch (error) {
            console.error('Error fetching inventory reservations:', error);
            throw error;
        }
    }

    /**
     * Inserts multiple inventory reservations dynamically by extracting fields
     * @param reservations List of reservation objects
     */
    async insertMultiple(
        reservations: InventoryReservationItem[],
    ): Promise<InventoryReservationItem[]> {
        if (reservations.length === 0) {
            return [];
        }

        const fields = Object.keys(reservations[0]);
        const fieldsCount = fields.length;

        const valuesPlaceholders = reservations
            .map(
                (_, rowIndex) =>
                    `(${fields.map((_, colIndex) => `$${rowIndex * fieldsCount + colIndex + 1}`).join(', ')})`,
            )
            .join(', ');

        const flatValues = reservations.flatMap((reservation) =>
            fields.map(
                (field) =>
                    reservation[field as keyof InventoryReservationItem] ??
                    null,
            ),
        );

        const query = `
            INSERT INTO inventory_reservations (${fields.map((f) => `"${f}"`).join(', ')})
            VALUES ${valuesPlaceholders} RETURNING *
        `;

        try {
            const result = await this.db.query(query, flatValues);
            return result.rows as InventoryReservationItem[];
        } catch (error) {
            console.error('Error inserting reservations:', error);
            throw error;
        }
    }

    async add(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inventoryItem: InventoryReservationItem,
    ): Promise<InventoryReservationItem> {
        return {} as InventoryReservationItem;
    }

    async update(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        id: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inventoryUpdate: Partial<InventoryReservationItem>,
    ): Promise<InventoryReservationItem> {
        return {} as InventoryReservationItem;
    }

    async updateMultiple(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        items: InventoryReservationItem[],
    ): Promise<InventoryReservationItem[]> {
        return [];
    }
}

export const processReservation = async (
    stocksToUpdate: Inventory[],
    reservations: InventoryReservationItem[],
): Promise<InventoryReservationSummary> => {
    try {
        const inventoryRepository = getRepository<Inventory>(
            dbConnection,
            InventoryRepositoryPostgres,
        );

        const reservationRepository = getRepository<InventoryReservationItem>(
            dbConnection,
            InventoryReservationRepository,
        );

        await dbConnection.query('BEGIN');
        await inventoryRepository.updateMultiple(stocksToUpdate);

        const insertedReservations =
            await reservationRepository.insertMultiple(reservations);

        if (!insertedReservations || insertedReservations.length === 0) {
            throw new Error('No reservations were inserted');
        }
        const reservationSummary: InventoryReservationSummary = {
            status: ReservationStatus.RESERVED,
            message: 'Reservation successful',
            reservations: insertedReservations,
        };
        await dbConnection.query('COMMIT');
        return reservationSummary;
    } catch (error) {
        await dbConnection.query('ROLLBACK');
        logger.error('Error processing reservation', error);
        throw error;
    }
};
