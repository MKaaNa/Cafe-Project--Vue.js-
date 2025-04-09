import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - token ekle
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - hata yönetimi
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth işlemleri
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });

// Kullanıcı işlemleri
export const fetchUsers = () => api.get('/users');
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Sipariş işlemleri
export const fetchOrders = () => api.get('/orders');
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Menü işlemleri
export const fetchMenu = () => api.get('/menu');
export const createMenuItem = (itemData) => api.post('/menu', itemData);
export const updateMenuItem = (id, itemData) => api.put(`/menu/${id}`, itemData);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Ödeme işlemleri
export const createPayment = async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
};

export const getPayments = async () => {
    const response = await api.get('/payments');
    return response.data;
};

export default api;
