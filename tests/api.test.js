import { fetchOrders, fetchUsers, updateOrderStatus, hashPassword } from '../src/utils/api';
import axios from 'axios';

jest.mock('axios');

describe('API Utility Functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetchOrders should return orders', async () => {
        const mockOrders = [{ id: 1, table: '5', total: 100 }];
        axios.get.mockResolvedValueOnce({ data: mockOrders });

        const orders = await fetchOrders();
        expect(orders).toEqual(mockOrders);
        expect(axios.get).toHaveBeenCalledWith('/orders');
    });

    test('fetchUsers should return users', async () => {
        const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
        axios.get.mockResolvedValueOnce({ data: mockUsers });

        const users = await fetchUsers();
        expect(users).toEqual(mockUsers);
        expect(axios.get).toHaveBeenCalledWith('/users');
    });

    test('updateOrderStatus should call API with correct data', async () => {
        const mockOrder = { id: 1, status: 'hazır', table: '5', total: 100 };
        axios.put.mockResolvedValueOnce();

        await updateOrderStatus(mockOrder.id, mockOrder);
        expect(axios.put).toHaveBeenCalledWith(`/orders/${mockOrder.id}`, mockOrder);
    });

    test('hashPassword should hash the password correctly', async () => {
        const password = 'mypassword';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).not.toEqual(password);
        expect(hashedPassword.length).toBeGreaterThan(0);
    });
});
