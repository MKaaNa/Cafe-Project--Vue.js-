import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // Backend URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// Her istekte Authorization başlığını ekle
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Token'ı localStorage'dan al
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; // Authorization başlığını ekle
    }
    return config;
});

// 401 hatalarını global olarak ele al
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.warn('Token geçersiz veya süresi dolmuş. Oturum kapatılıyor.');
            localStorage.removeItem('user'); // Kullanıcı bilgilerini temizle
            localStorage.removeItem('token'); // Token'ı temizle
            window.location.href = '/login'; // Login sayfasına yönlendir
        }
        return Promise.reject(error);
    }
);

export default api;
