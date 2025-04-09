import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token'ı localStorage'dan al ve her istekte header'a ekle
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Kullanıcı işlemleri
export const register = (userData) => api.post('/register', userData);
export const login = (credentials) => api.post('/login', credentials);
export const getCurrentUser = () => api.get('/users/me');

// Kullanıcı yönetimi
export const fetchUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (userId, userData) => api.put(`/users/${userId}`, userData);
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// Sipariş işlemleri
export const fetchOrders = () => api.get('/orders');
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}/status`, { status });

// Menü işlemleri
export const fetchMenu = () => api.get('/menu');
export const createMenuItem = (itemData) => api.post('/menu', itemData);
export const updateMenuItem = (itemId, itemData) => api.put(`/menu/${itemId}`, itemData);
export const deleteMenuItem = (itemId) => api.delete(`/menu/${itemId}`);

// Ödeme işlemleri
export const fetchPayments = () => api.get('/payments');
export const createPayment = (paymentData) => api.post('/payments', paymentData);

export default api;
