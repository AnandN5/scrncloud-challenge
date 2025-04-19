import { Inventory } from '../../interfaces/inventory.interface';
import {
    InventoryReservationItem,
    StockReserveRequest,
} from '../../interfaces/inventory.reservation.interface';
import { ReservationStatus } from '../constants';

export const reduceReservedQtyFromStock = (
    reservationRequest: StockReserveRequest[],
    stock: Inventory[],
): Inventory[] => {
    // sort the reservation request by warehouse priority
    reservationRequest.sort((a, b) => {
        const warehousePriorityA = a.warehouse_priority;
        const warehousePriorityB = b.warehouse_priority;
        return warehousePriorityA - warehousePriorityB;
    });

    const stockMap = new Map<string, Inventory>();

    // Create a map of stock items for quick access
    stock.forEach((item) => {
        stockMap.set(`${item.warehouse_id}-${item.device_id}`, item);
    });

    // Reduce the stock based on the reservation request
    reservationRequest.forEach((request) => {
        const stockItemKey = `${request.warehouse_id}-${request.device_id}`;
        const stockItem = stockMap.get(stockItemKey);
        if (stockItem) {
            const availableStock = stockItem.stock;
            const requestedQuantity = request.quantity;
            if (availableStock >= requestedQuantity) {
                stockItem.stock -= requestedQuantity;
            } else {
                // If not enough stock, set it to zero
                stockItem.stock = 0;
            }
            // Update the stock item in the map
            stockMap.set(stockItemKey, stockItem);
        }
    });

    return Array.from(stockMap.values());
};

export const reservationItems = (
    reservationRequest: StockReserveRequest[],
    stock: Inventory[],
): InventoryReservationItem[] => {
    const reservationItems: InventoryReservationItem[] = [];
    for (let i = 0; i < reservationRequest.length; i++) {
        const request = reservationRequest[i];
        const stockItem = stock.find(
            (item) =>
                item.warehouse_id === request.warehouse_id &&
                item.device_id === request.device_id,
        );
        if (stockItem) {
            const reservationItem: InventoryReservationItem = {
                warehouse_id: request.warehouse_id,
                device_id: request.device_id,
                quantity: request.quantity,
                // inventory_id: stockItem.id,
                order_id: request.order_id,
                status: ReservationStatus.RESERVED,
            };
            reservationItems.push(reservationItem);
        }
    }

    return reservationItems;
};
