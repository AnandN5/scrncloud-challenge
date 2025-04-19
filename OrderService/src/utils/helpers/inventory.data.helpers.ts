import { FulfillmentPlan } from "../../interfaces/fulfillment.interface";
import { StockReserveRequest } from "../../interfaces/inventory.interface";

export const inventoryReservationRequestData = (
  orderId: string,
  fulfillmentPlan: FulfillmentPlan[]
): StockReserveRequest[] => {
  const stockReserveRequests: StockReserveRequest[] = [];
  // Sort the fulfillment plan by distance in ascending order
  const sortedFulfillmentPlan = fulfillmentPlan.sort(
    (a, b) => a.distance - b.distance
  );

  // Iterate through the sorted fulfillment plan and create stock reserve requests
  sortedFulfillmentPlan.forEach((plan, index) => {
    stockReserveRequests.push({
      order_id: orderId,
      warehouse_id: plan.warehouse_id,
      device_id: plan.device_id,
      quantity: plan.quantity_fulfilled,
      warehouse_priority: index + 1, // Assign warehouse priority based on sorted order
    });
  });

  return stockReserveRequests;
};
