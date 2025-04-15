import { GetStockResponse } from "../interfaces/inventory.interface";

/**
 * Calculate the distance between warehouses and order location using Haversine formula
 * and sort the stocks by distance.
 * @param stocks - Array of stocks with warehouse information
 * @param orderLat - Latitude of the order location
 * @param orderLon - Longitude of the order location
 * @returns - Array of stocks with distance from the order location and sorted
 */
export const sortStockByWarehouseDistance = (
    stocks: GetStockResponse[],
    orderLat: number,
    orderLon: number,
): (GetStockResponse & { distance: number })[] => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 6371;
    const orderLatRad = toRadians(orderLat);
    const orderLonRad = toRadians(orderLon);
    
    const cosSourceLat = Math.cos(orderLatRad);

    const nearbyWarehouses: (GetStockResponse & { distance: number })[] = []
    stocks.map((stoke) => {
        const sourceLatRad = toRadians(stoke.warehouse.latitude);
        const sourceLonRad = toRadians(stoke.warehouse.longitude);

        const dLat = sourceLatRad - orderLatRad;
        const dLon = sourceLonRad - orderLonRad;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            cosSourceLat * Math.cos(sourceLatRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        nearbyWarehouses.push({ ...stoke, distance });
    });
    return nearbyWarehouses.sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
};