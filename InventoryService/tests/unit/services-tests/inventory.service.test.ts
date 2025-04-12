import inventoryService from '../../../src/services/inventory.service';
import { InventoryRepositoryPostgres } from '../../../src/repositories/inventory.repository.postgres';
import getRepository from '../../../src/repositories/repository';

jest.mock('../../../src/repositories/repository');

// jest.mock('../../../src/repositories/inventory.repository.postgres', () => {
//     return {
//         InventoryRepositoryPostgres: jest.fn().mockImplementation(() => ({
//             addInventory: jest.fn(),
//             getInventory: jest.fn(),
//             updateInventory: jest.fn(),
//         })),
//     };
// });

describe('InventoryService', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new inventory', async () => {

        const mockInventory = {
            warehouse_id: 'warehouse-uuid',
            device_id: 'device-uuid',
            stock: 100,
        } as any;

        const mockResponse = {
            id: 'inventory-uuid',
            ...mockInventory,
            created_at: new Date(),
            updated_at: new Date(),
        } as any;

        const mockRepository = {
            addInventory: jest.fn().mockResolvedValue(mockResponse),
        };

        (getRepository as jest.Mock).mockReturnValue(mockRepository);


        const result = await inventoryService.addInventory(mockInventory);

        expect(result).toEqual(mockResponse);
    });

    it('should fetch inventories with filters', async () => {

        const mockFilters = { warehouse_id: 'warehouse-uuid' };
        const mockResponse = [
            {
                id: 'inventory-uuid',
                warehouse_id: 'warehouse-uuid',
                device_id: 'device-uuid',
                stock: 100,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        const mockRepository = {
            getInventory: jest.fn().mockResolvedValue(mockResponse),
        };

        (getRepository as jest.Mock).mockReturnValue(mockRepository);

        const result = await inventoryService.getInventories(mockFilters);

        expect(result).toEqual(mockResponse);
    });

    it('should update an inventory', async () => {
        const mockId = 'inventory-uuid';
        const mockUpdate = { stock: 150 };
        const mockResponse = [
            {
                id: 'inventory-uuid',
                warehouse_id: 'warehouse-uuid',
                device_id: 'device-uuid',
                stock: 150,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        const mockRepository = {
            getInventory: jest.fn().mockResolvedValue(mockResponse),
            updateInventory: jest.fn().mockResolvedValue(mockResponse),
        };

        (getRepository as jest.Mock).mockReturnValue(mockRepository);

        const result = await inventoryService.updateInventory(mockId, mockUpdate);

        expect(result).toEqual(mockResponse);
    });
});