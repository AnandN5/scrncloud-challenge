import { Warehouse } from "../interfaces/warehouse.interface";

/**
 * Calculate the Haversine distance between two geographical points.
 * @param {number} sourceLat - Latitude of the source point.
 * @param {number} sourceLon - Longitude of the source point.
 * @param {Warehouse[]} warehouses - Array of warehouse objects with latitude and longitude properties.
 * @returns {PotentialWarehousesResponse} - An array of potential warehouses sorted by distance from the source point.
 */
export const calculateHaversineDistanceBatch = (
    warehouses: Warehouse[],
    sourceLat: number,
    sourceLon: number,
): any => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const R = 6371;
    const sourceLatRad = toRadians(sourceLat);
    const sourceLonRad = toRadians(sourceLon);
    // cos(sourceLat) is constant hence precomputing it
    const cosSourceLat = Math.cos(sourceLatRad);

    const nearbyWarehouses: any = []
    warehouses.map((warehouse) => {
        const destLatRad = toRadians(warehouse.latitude);
        const destLonRad = toRadians(warehouse.longitude);

        const dLat = destLatRad - sourceLatRad;
        const dLon = destLonRad - sourceLonRad;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            cosSourceLat * Math.cos(destLatRad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        nearbyWarehouses.push({ warehouse, distance });
    });
    return nearbyWarehouses.sort((a: {distance: number}, b: {distance: number}) => a.distance - b.distance);
};