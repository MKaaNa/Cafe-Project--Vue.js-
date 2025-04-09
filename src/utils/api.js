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
export const login = (credentials) => api.post('/login', credentials);
export const register = (userData) => api.post('/register', userData);
export const forgotPassword = (email) => api.post('/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/reset-password', { token, password });

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
export const createPayment = (paymentData) => api.post('/payments', paymentData);
export const getPayments = () => api.get('/payments');

// Fatura işlemleri
export const fetchInvoice = (invoiceId) => api.get(`/api/invoices/${invoiceId}`);
export const downloadInvoice = (invoiceId) => api.get(`/api/invoices/${invoiceId}/download`, {
    responseType: 'blob'
});

// QR kod işlemleri
export const generateQRCode = (data) => api.post('/api/qr/generate', { data });

// Yeni eklenen işlemler
export const fetchStaffStats = () => api.get('/staff/stats');
export const updateStaffStats = (id, statsData) => api.put(`/staff/stats/${id}`, statsData);
export const createStaffStats = (statsData) => api.post('/staff/stats', statsData);
export const createDailyIncome = (incomeData) => api.post('/daily-income', incomeData);

export default api;
