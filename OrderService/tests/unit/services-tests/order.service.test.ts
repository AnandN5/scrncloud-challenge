import orderService from '../../../src/services/order.service';
import deviceService from '../../../src/services/device.service';
import inventoryService from '../../../src/services/inventory.service';
import fulfillmentService from '../../../src/services/fulfillment.service';
import discountService from '../../../src/services/discount.service';
import { uuid } from 'uuidv4';
import { OrderStatus } from '../../../src/utils/constants';
import getOrderRepository from '../../../src/repositories/repository';
import dbConnection from '../../../src/config/postgresdb';

// filepath: OrderService/src/services/order.service.test.ts

jest.mock('../../../src/services/device.service');
jest.mock('../../../src/services/inventory.service');
jest.mock('../../../src/services/fulfillment.service');
jest.mock('uuidv4', () => ({
    uuid: jest.fn(),
}));
jest.mock('../../../src/services/discount.service');
jest.mock('../../../src/repositories/repository', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('OrderService - placeOrder', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if the device is not found', async () => {
        (deviceService.getDeviceById as jest.Mock).mockResolvedValue(null);

        const orderParams = { device_id: 'device-123', quantity: 1 } as any;

        await expect(orderService.placeOrder(orderParams)).rejects.toThrow(
            'No device found for the given ID: "device-123"',
        );
    });

    it('should return NON_FULFILLABLE if stock is insufficient', async () => {
        (deviceService.getDeviceById as jest.Mock).mockResolvedValue({
            id: 'device-123',
        });
        (inventoryService.getStock as jest.Mock).mockResolvedValue([
            {
                device_id: 'device-123',
                warehouse_id: 'warehouse-123',
                stock: 0,
            },
        ]);

        const orderParams = { device_id: 'device-123', quantity: 10 } as any;

        const result = await orderService.placeOrder(orderParams);

        expect(result.status).toBe(OrderStatus.NON_FULFILLABLE);
        expect(inventoryService.getStock).toHaveBeenCalledWith({
            device_ids: ['device-123'],
        });
    });

    it('should return NON_FULFILLABLE if fulfillment data is not found', async () => {
        (deviceService.getDeviceById as jest.Mock).mockResolvedValue({
            id: 'device-123',
        });
        (inventoryService.getStock as jest.Mock).mockResolvedValue([
            {
                device_id: 'device-123',
                warehouse_id: 'warehouse-123',
                stock: 10,
            },
        ]);
        (
            fulfillmentService.getFulfillmentDryRun as jest.Mock
        ).mockResolvedValue(null);

        const orderParams = { device_id: 'device-123', quantity: 10 } as any;

        const result = await orderService.placeOrder(orderParams);

        expect(result.status).toBe(OrderStatus.NON_FULFILLABLE);
        expect(fulfillmentService.getFulfillmentDryRun).toHaveBeenCalled();
    });

    // it('should return NON_FULFILLABLE if fulfillment status is NOT_FULFILLABLE', async () => {
    //     (deviceService.getDeviceById as jest.Mock).mockResolvedValue({
    //         id: 'device-123',
    //     });
    //     (inventoryService.getStock as jest.Mock).mockResolvedValue([
    //         { stock: 100 },
    //     ]);
    //     (
    //         fulfillmentService.getFulfillmentDryRun as jest.Mock
    //     ).mockResolvedValue({
    //         fulfillment_status: 'NOT_FULFILLABLE',
    //     });

    //     const orderParams = { device_id: 'device-123', quantity: 10 } as any;

    //     const result = await orderService.placeOrder(orderParams);

    //     expect(result.status).toBe(OrderStatus.NON_FULFILLABLE);
    // });

    it('should place an order successfully with discount', async () => {
        const mockDevice = {
            device_id: 'device-123',
            price: 100,
            weight_kg: 1,
            device_name: 'Device Name',
            deleted: false,
        };
        const mockFulfillmentData = {
            fulfillment_status: 'FULFILLABLE',
            fulfillment_plan: [
                {
                    warehouse_id: 'warehouse-123',
                    warehouse_name: 'Main Warehouse',
                    distance: 1000,
                    device_id: 'device-123',
                    quantity_requested: 10,
                    quantity_fulfilled: 10,
                },
            ],
        };

        const mockOrderCreate = {
            order_id: 'order-123',
            latitude: 0,
            longitude: 0,
            quantity: 10,
            device_id: 'device-123',
        };
        const mockOrder = {
            id: 'order-123',
            total_shipping_cost: 100,
            total_price: 500,
            total_discount: 50,
            latitude: 0,
            longitude: 0,
            status: OrderStatus.PENDING,
            items: [
                {
                    device_id: 'device-123',
                    device_name: 'Device Name',
                    unit_price: 100,
                    unit_weight: 1,
                    total_item_price: 1000,
                    quantity: 10,
                    discount: 50,
                },
            ],
        };
        const mockCreate = jest.fn().mockResolvedValue(mockOrderCreate);

        (deviceService.getDeviceById as jest.Mock).mockResolvedValue(
            mockDevice,
        );
        (inventoryService.getStock as jest.Mock).mockResolvedValue([
            { stock: 100 },
        ]);
        (
            fulfillmentService.getFulfillmentDryRun as jest.Mock
        ).mockResolvedValue(mockFulfillmentData);
        (inventoryService.reserveStock as jest.Mock).mockResolvedValue(true);
        (discountService.getDiscountByOrderItem as jest.Mock).mockResolvedValue(
            {
                device_id: 'device-123',
                discount: 50,
                volume: 50,
            },
        );
        (uuid as jest.Mock).mockReturnValue('order-123');
        (getOrderRepository as jest.Mock).mockReturnValue({
            create: mockCreate,
        });
        const orderRepository = getOrderRepository(dbConnection);

        const orderParams = {
            device_id: 'device-123',
            quantity: 10,
            latitude: 0,
            longitude: 0,
        } as any;

        const result = await orderService.placeOrder(orderParams);

        expect(result).toEqual(mockOrder);
        expect(deviceService.getDeviceById).toHaveBeenCalledWith('device-123');
        expect(inventoryService.getStock).toHaveBeenCalledWith({
            device_ids: ['device-123'],
        });
        expect(fulfillmentService.getFulfillmentDryRun).toHaveBeenCalled();
        expect(inventoryService.reserveStock).toHaveBeenCalled();
        expect(orderRepository.create).toHaveBeenCalled();
    });

    it('should place an order successfully without discount', async () => {
        const mockDevice = {
            device_id: 'device-123',
            price: 100,
            weight_kg: 1,
            device_name: 'Device Name',
            deleted: false,
        };
        const mockFulfillmentData = {
            fulfillment_status: 'FULFILLABLE',
            fulfillment_plan: [
                {
                    warehouse_id: 'warehouse-123',
                    warehouse_name: 'Main Warehouse',
                    distance: 1000,
                    device_id: 'device-123',
                    quantity_requested: 10,
                    quantity_fulfilled: 10,
                },
            ],
        };

        const mockOrderCreate = {
            order_id: 'order-123',
            latitude: 0,
            longitude: 0,
            quantity: 10,
            device_id: 'device-123',
        };
        const mockOrder = {
            id: 'order-123',
            total_shipping_cost: 100,
            total_price: 1000,
            total_discount: 0,
            latitude: 0,
            longitude: 0,
            status: OrderStatus.PENDING,
            items: [
                {
                    device_id: 'device-123',
                    device_name: 'Device Name',
                    unit_price: 100,
                    unit_weight: 1,
                    total_item_price: 1000,
                    quantity: 10,
                    discount: 0,
                },
            ],
        };
        const mockCreate = jest.fn().mockResolvedValue(mockOrderCreate);

        (deviceService.getDeviceById as jest.Mock).mockResolvedValue(
            mockDevice,
        );
        (inventoryService.getStock as jest.Mock).mockResolvedValue([
            { stock: 100 },
        ]);
        (
            fulfillmentService.getFulfillmentDryRun as jest.Mock
        ).mockResolvedValue(mockFulfillmentData);
        (inventoryService.reserveStock as jest.Mock).mockResolvedValue(true);
        (discountService.getDiscountByOrderItem as jest.Mock).mockResolvedValue(
            {
                device_id: 'device-123',
                discount: 0,
                volume: 50,
            },
        );
        (uuid as jest.Mock).mockReturnValue('order-123');
        (getOrderRepository as jest.Mock).mockReturnValue({
            create: mockCreate,
        });
        const orderRepository = getOrderRepository(dbConnection);

        const orderParams = {
            device_id: 'device-123',
            quantity: 10,
            latitude: 0,
            longitude: 0,
        } as any;

        const result = await orderService.placeOrder(orderParams);

        expect(result).toEqual(mockOrder);
        expect(deviceService.getDeviceById).toHaveBeenCalledWith('device-123');
        expect(inventoryService.getStock).toHaveBeenCalledWith({
            device_ids: ['device-123'],
        });
        expect(fulfillmentService.getFulfillmentDryRun).toHaveBeenCalled();
        expect(inventoryService.reserveStock).toHaveBeenCalled();
        expect(orderRepository.create).toHaveBeenCalled();
    });
});
